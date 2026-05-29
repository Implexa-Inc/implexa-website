'use strict';

/**
 * /api/v2/partners/* — public lead-capture for the partner API track.
 *
 * File location at rest
 * ─────────────────────
 * This file belongs in the implexa-backend repo at:
 *   implexa-backend/src/routes/partners.js
 *
 * It lives in implexa-website/scripts/partner-waitlist/ for now because
 * the feat/developers-page PR introduces the website surface; this
 * route is the matching backend change. When the PR merges, move this
 * file into the backend repo and mount it in implexa-backend/server.js:
 *
 *   const partnersRouter = require('./src/routes/partners');
 *   app.use('/api/v2/partners', partnersRouter);
 *
 * Routes
 * ──────
 *   POST /api/v2/partners/waitlist
 *     Body: { email, product, use_case, user_agent?, referer? }
 *     Auth: Bearer IMPLEXA_PUBLIC_SEARCH_TOKEN (same token /scores uses)
 *     Returns: 201 on insert, 409 if the email is already on the list,
 *              400 on validation failure, 401 on bad token, 500 on
 *              upstream DB failure.
 *
 * Why a dedicated route (not an MCP tool)
 * ───────────────────────────────────────
 * The waitlist is captured from a browser server action, not from an
 * MCP client. Going through tools/call would force the website to speak
 * JSON-RPC + SSE for a one-shot POST. A plain REST endpoint matches the
 * other lead-capture surfaces in the backend (auth provision, billing
 * checkout, etc.) and keeps the MCP catalog clean.
 *
 * Auth
 * ────
 * Reuses the public search bearer token (IMPLEXA_PUBLIC_SEARCH_TOKEN).
 * This token is server-only on the website; the browser never sees it.
 * Same posture as /api/search and /scores — the token represents "the
 * implexa.ai marketing site, talking to its own backend".
 */

const express = require('express');
const crypto  = require('crypto');
const { serviceClient } = require('../lib/supabase');
const Logger  = require('../lib/logger');

const router = express.Router();

const PUBLIC_TOKEN = process.env.IMPLEXA_PUBLIC_SEARCH_TOKEN || '';

// Stricter than the email shape on the website (which is purely UX). The
// backend is the source of truth for validation; the website's pre-check
// just keeps the round-trip cheap.
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[A-Za-z0-9-]+$/;

// Lightweight bearer-token gate. We don't need a per-user identity here
// (the row is partner-not-user scoped) — we just need to confirm the
// caller is the marketing site, not an arbitrary internet POST. Returns
// the same 401 shape every other gated backend route uses.
function requirePublicToken(req, res, next) {
  if (!PUBLIC_TOKEN) {
    // Misconfigured backend — fail closed rather than letting anyone POST.
    Logger.warn('partners.waitlist: IMPLEXA_PUBLIC_SEARCH_TOKEN unset; refusing requests');
    return res.status(503).json({ error: 'waitlist temporarily unavailable' });
  }
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing bearer token' });
  }
  // Constant-time compare so a curious onlooker can't time-attack the
  // token. crypto.timingSafeEqual requires equal-length buffers; pad
  // both to the same fixed length first.
  const presented = Buffer.from(auth.slice(7).trim().padEnd(128, '\0'));
  const expected  = Buffer.from(PUBLIC_TOKEN.padEnd(128, '\0'));
  if (!crypto.timingSafeEqual(presented, expected)) {
    return res.status(401).json({ error: 'invalid bearer token' });
  }
  return next();
}

// ── POST /api/v2/partners/waitlist ────────────────────────────────────
router.post('/waitlist', express.json({ limit: '8kb' }), requirePublicToken, async (req, res) => {
  const body = req.body || {};

  // ── validate ──────────────────────────────────────────────────────
  const email   = String(body.email   || '').trim().toLowerCase();
  const product = String(body.product || '').trim();
  const useCase = String(body.use_case || '').trim();
  const userAgent = body.user_agent ? String(body.user_agent).slice(0, 500) : null;
  const referer   = body.referer   ? String(body.referer).slice(0, 500)   : null;

  if (!email || !EMAIL_RX.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'invalid email' });
  }
  if (!product || product.length > 120) {
    return res.status(400).json({ error: 'invalid product (1..120 chars)' });
  }
  if (!useCase || useCase.length < 20 || useCase.length > 2000) {
    return res.status(400).json({ error: 'invalid use_case (20..2000 chars)' });
  }

  // ── write ─────────────────────────────────────────────────────────
  try {
    const { data, error } = await serviceClient
      .from('partner_waitlist')
      .insert({
        email,
        product,
        use_case: useCase,
        user_agent: userAgent,
        referer,
      })
      .select('id, created_at')
      .single();

    if (error) {
      // 23505 = postgres unique_violation. We dedupe on lower(email) so
      // a re-submit hits this branch — render as 409 so the website can
      // show the "you're already on the list" panel.
      if (error.code === '23505') {
        return res.status(409).json({ error: 'already on waitlist' });
      }
      Logger.error('partners.waitlist insert failed', {
        email_hash: crypto.createHash('sha256').update(email).digest('hex').slice(0, 12),
        code: error.code,
        message: error.message,
      });
      return res.status(500).json({ error: 'could not record waitlist entry' });
    }

    Logger.info('partners.waitlist accepted', {
      id: data.id,
      product,
      // Don't log the raw email — logs flow through observability tools
      // we don't own. Hash prefix is enough to correlate two log lines
      // for the same submitter if we need to debug.
      email_hash: crypto.createHash('sha256').update(email).digest('hex').slice(0, 12),
    });

    return res.status(201).json({ ok: true, id: data.id });
  } catch (err) {
    Logger.error('partners.waitlist unexpected', { message: err.message });
    return res.status(500).json({ error: 'could not record waitlist entry' });
  }
});

module.exports = router;
