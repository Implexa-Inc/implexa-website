// Centralized site URL config. Every place that emits an absolute URL
// (canonical tags, sitemap entries, JSON-LD @id values, OG image references)
// should read from here, never inline the literal "https://implexa.ai".
//
// In production NEXT_PUBLIC_SITE_URL is set to "https://implexa.ai" via
// Vercel env. In local dev (or preview deployments) the env var is unset
// and we fall back to the canonical production origin so absolute URLs
// stay stable for crawler tooling. The Vercel branch URL would be cleaner
// for preview deploys but Google + Perplexity should never index those.

const RAW = process.env.NEXT_PUBLIC_SITE_URL ?? "https://implexa.ai";

// Strip a trailing slash so concatenation `${SITE_URL}/path` never produces
// `//path`. URLs with no trailing slash are the canonical form on this site.
export const SITE_URL = RAW.replace(/\/+$/, "");

export const SITE_NAME = "implexa";
export const SITE_TITLE = "implexa, google + wikipedia for SKILL.md";
export const SITE_DESCRIPTION =
  "cross-vendor skill graph for AI work. implexa watches you work and hands you the right skill at the right time.";

export const TWITTER_HANDLE = "@ImplexaAI";

// Resolves a path against SITE_URL. Pass a leading-slash path or an absolute
// URL (passthrough). Returns the absolute form. Used by JSON-LD, sitemap,
// OG image meta, and canonical tags so we never accidentally emit a relative
// URL into a place that requires absolute.
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}
