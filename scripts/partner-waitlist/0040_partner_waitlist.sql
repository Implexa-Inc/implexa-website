-- ───────────────────────────────────────────────────────────────────────────
-- 0040 — partner_waitlist
-- ───────────────────────────────────────────────────────────────────────────
--
-- File location at rest
-- ─────────────────────
-- This migration belongs in the implexa-backend repo at:
--   implexa-backend/supabase/migrations/0040_partner_waitlist.sql
--
-- It lives in implexa-website temporarily because the website's
-- feat/developers-page branch is the PR that introduces the waitlist
-- surface. When that PR merges, move this file into the backend repo and
-- apply it via the standard supabase migration flow.
--
-- Why
-- ───
-- /developers (the new builder-facing page) captures interest from
-- partners (Mastra, Continue.dev, Cline, etc.) who want direct API
-- access to the implexa MCP tools. Until the partner_api_keys self-serve
-- flow is live (see 0039_partner_api_keys.sql, currently on
-- feat/partner-api-auth), we just collect email + product + use case
-- and triage manually.
--
-- Relationship to partner_api_keys
-- ────────────────────────────────
-- partner_waitlist is the FUNNEL stage; partner_api_keys is the
-- ACTIVATION stage. A row in partner_waitlist may become zero, one, or
-- many rows in partner_api_keys (the same partner org might mint a
-- staging key and a production key). We don't FK between the two — the
-- waitlist is intentionally low-friction and shouldn't block on the
-- partner having a valid org yet.
--
-- Idempotency
-- ───────────
-- Email is the dedupe key. The same email submitting twice should be
-- a no-op for the database (the backend route treats this as a 409 and
-- the page renders the same "you're on the list" thanks panel). A
-- unique index on lower(email) handles the case-insensitive collision.
--
-- Capture surface
-- ───────────────
-- We log user_agent + referer as best-effort context for the founder
-- when triaging. NOT used for tracking; not stored on partner_api_keys
-- once a key issues. Free-form text; nullable.
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.partner_waitlist (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  email           text NOT NULL,
  product         text NOT NULL,                        -- partner product / company name
  use_case        text NOT NULL,                        -- free-form: "what do you want to build"

  -- best-effort triage context, populated by the website server action.
  -- nullable on purpose; the page degrades to "no context" if the next
  -- runtime stops exposing the headers we read.
  user_agent      text,
  referer         text,

  -- triage state. v1 only cares about 'pending' vs 'reached_out' vs
  -- 'issued_key'; expand the enum if we ever build a real CRM around this.
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'reached_out', 'issued_key', 'declined')),

  created_at      timestamptz NOT NULL DEFAULT now(),
  contacted_at    timestamptz,
  notes           text                                  -- free-form, founder-only
);

-- Case-insensitive dedupe on email. The route lowercases before insert,
-- but the constraint is on lower(email) so anything that bypasses the
-- route (e.g. a manual psql insert) still dedupes. Functional indexes
-- can't be used as a CONSTRAINT target so this stays a unique INDEX.
CREATE UNIQUE INDEX IF NOT EXISTS uq_partner_waitlist_email_lower
  ON public.partner_waitlist (lower(email));

-- Triage list: founder dashboard query is "pending, oldest first".
CREATE INDEX IF NOT EXISTS idx_partner_waitlist_status_created
  ON public.partner_waitlist (status, created_at)
  WHERE status = 'pending';

COMMENT ON TABLE public.partner_waitlist IS
  'Lead capture for the partner API track (Mastra, Continue.dev, etc). Distinct from partner_api_keys (which represents an issued key). One row per unique email; idempotent inserts via the unique index on lower(email). Filled by POST /api/v2/partners/waitlist from implexa.ai/developers.';

COMMENT ON COLUMN public.partner_waitlist.product IS
  'Partner product or company name. Free-form text capped at 120 chars by the route. Examples: "Mastra", "Continue.dev", "internal agent at Acme".';

COMMENT ON COLUMN public.partner_waitlist.use_case IS
  'Free-form description of how they want to call implexa. Capped at 2000 chars by the route. Read by the founder during triage to decide whether/when to issue a key.';

COMMENT ON COLUMN public.partner_waitlist.status IS
  'Triage state. pending = unread / not yet contacted. reached_out = founder replied, key not yet issued. issued_key = partner_api_keys row created for this partner. declined = not a fit (rare).';


-- ── RLS ──────────────────────────────────────────────────────────────────
-- Default-deny. The backend route writes via service role (which bypasses
-- RLS). No anon access — the waitlist holds emails + use-case text the
-- partner wrote in confidence; surfacing it through the anon key would
-- be a leak. Enable RLS with no policies so default-deny is explicit.
ALTER TABLE public.partner_waitlist ENABLE ROW LEVEL SECURITY;
