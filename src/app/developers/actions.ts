"use server";

// Server Action for the /developers page waitlist form.
//
// The form is small (email, product name, intended use case) and the
// destination is the implexa backend's POST /api/v2/partners/waitlist
// route. That route (see scripts/partner-waitlist/partners-route.js in
// this repo as the deployment artifact) writes a row into the new
// public.partner_waitlist table.
//
// Why a server action and not a client fetch:
//   1. Keeps the bearer token out of the browser. The backend's waitlist
//      route reuses IMPLEXA_PUBLIC_SEARCH_TOKEN (same token /scores and
//      /search proxy with); the token is server-side env.
//   2. Built-in progressive enhancement: works without JS, gets pending
//      state via useActionState on the client component.
//   3. One round-trip. No exposed API route on this app.
//
// Validation is minimal on purpose. The backend is the source of truth
// (it dedupes by lowercased email, caps product/use_case length, and
// strips control characters). We do client-friendly type + length checks
// here so the form returns a fast error instead of a 400 from upstream.

import { headers } from "next/headers";
import type { WaitlistState } from "./waitlist-state";

// Next 16 enforces that a "use server" module exports only async functions.
// WaitlistState (type) + initialWaitlistState (const) therefore live in a
// sibling regular module (waitlist-state.ts) and are imported by both
// this action and the client form.

const BACKEND = process.env.IMPLEXA_API_URL ?? "https://core.implexa.ai";
const TOKEN = process.env.IMPLEXA_PUBLIC_SEARCH_TOKEN ?? "";

// Basic email shape check. Backend re-validates with a stricter regex.
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitPartnerWaitlist(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const product = String(formData.get("product") ?? "").trim();
  const useCase = String(formData.get("useCase") ?? "").trim();

  // ── client-friendly validation ──────────────────────────────────────
  const fieldErrors: WaitlistState["fieldErrors"] = {};
  if (!email) fieldErrors.email = "required";
  else if (!EMAIL_RX.test(email)) fieldErrors.email = "not a valid email";
  else if (email.length > 254) fieldErrors.email = "too long";

  if (!product) fieldErrors.product = "required";
  else if (product.length > 120) fieldErrors.product = "keep it under 120 chars";

  if (!useCase) fieldErrors.useCase = "required";
  else if (useCase.length < 20)
    fieldErrors.useCase = "tell us a bit more (20+ chars)";
  else if (useCase.length > 2000)
    fieldErrors.useCase = "keep it under 2000 chars";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "please fix the highlighted fields",
      fieldErrors,
    };
  }

  // ── collect a few non-PII context fields ────────────────────────────
  // Useful for the founder when triaging the waitlist. Best-effort; if
  // any header read fails, we just skip the field.
  let userAgent: string | undefined;
  let referer: string | undefined;
  try {
    const h = await headers();
    userAgent = h.get("user-agent") ?? undefined;
    referer = h.get("referer") ?? undefined;
  } catch {
    // headers() can only be called in a request scope; the action is in
    // one, but be defensive against future-runtime changes.
  }

  // ── post to backend ─────────────────────────────────────────────────
  if (!TOKEN) {
    // Server is misconfigured (no token). Don't claim success to the user.
    return {
      status: "error",
      message:
        "we're having trouble recording the waitlist right now. please email founder@implexa.ai directly.",
    };
  }

  try {
    const upstream = await fetch(`${BACKEND}/api/v2/partners/waitlist`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        email,
        product,
        use_case: useCase,
        user_agent: userAgent,
        referer,
      }),
      // Form submission is interactive; don't let a slow backend hang the
      // submit button forever. 8s is the same cap /api/search uses.
      signal: AbortSignal.timeout(8000),
      // Don't cache form submissions.
      cache: "no-store",
    });

    if (upstream.status === 409) {
      // Backend uses 409 for "email already on the list". From the user's
      // perspective that's fine: they're already in. Render as success.
      return {
        status: "ok",
        message: "you're already on the list. we'll be in touch.",
      };
    }

    if (!upstream.ok) {
      // 404 here usually means the backend route isn't deployed yet.
      // Surface a graceful fallback so the founder can wire it post-merge.
      if (upstream.status === 404) {
        return {
          status: "error",
          message:
            "the waitlist endpoint isn't live yet. please email founder@implexa.ai directly and we'll add you manually.",
        };
      }
      return {
        status: "error",
        message: `upstream returned ${upstream.status}. please try again or email founder@implexa.ai.`,
      };
    }

    return {
      status: "ok",
      message: "you're on the list. we'll email when partner keys open up.",
    };
  } catch (err) {
    // Network / timeout / abort. Always recoverable, never blame the user.
    const detail = err instanceof Error ? err.message : "unknown error";
    return {
      status: "error",
      message: `couldn't reach the waitlist service (${detail}). please email founder@implexa.ai.`,
    };
  }
}
