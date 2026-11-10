// signup-attribution.ts - where a sign-up came from.
//
// The website and the dashboard are different origins (implexa.ai and
// app.implexa.ai), so nothing stored here is readable by the dashboard. Instead
// the first page of the visit is remembered for the browser session, and every
// link to the dashboard's /signup carries it as query parameters. The dashboard
// keeps those parameters through the OAuth round-trip and saves them on the new
// account. Only paths and a referrer HOST are kept, never full URLs or query
// strings, so nothing a visitor typed into another site travels with them.

export const APP_HOST = "app.implexa.ai";
export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type FirstTouch = {
  lp: string; // landing path on implexa.ai
  ref: string; // external referrer host, "" when direct or internal
} & Partial<Record<(typeof UTM_KEYS)[number], string>>;

const MAX_VALUE = 200;

function clip(v: string): string {
  return v.slice(0, MAX_VALUE);
}

// Build the first-touch record for a page view. `referrer` is
// document.referrer; a referrer on this site is not an acquisition source.
export function firstTouchFrom(
  location: { pathname: string; search: string; hostname: string },
  referrer: string,
): FirstTouch {
  let ref = "";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host && host !== location.hostname.replace(/^www\./, "")) ref = host;
  } catch {
    // empty or malformed referrer: treat as direct
  }
  const touch: FirstTouch = { lp: clip(location.pathname), ref: clip(ref) };
  const params = new URLSearchParams(location.search);
  for (const key of UTM_KEYS) {
    const v = params.get(key);
    if (v) touch[key] = clip(v);
  }
  return touch;
}

// Add attribution parameters to a dashboard sign-up URL. Returns null for any
// other URL. Existing parameters win, so a link that already names its own
// campaign is never overwritten.
export function decorateSignupHref(
  href: string,
  touch: FirstTouch | null,
  ctaPath: string,
): string | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.hostname !== APP_HOST || url.pathname !== "/signup") return null;
  const set = (k: string, v: string | undefined) => {
    if (v && !url.searchParams.has(k)) url.searchParams.set(k, clip(v));
  };
  set("cta", ctaPath);
  if (touch) {
    set("lp", touch.lp);
    set("ref", touch.ref);
    for (const key of UTM_KEYS) set(key, touch[key]);
  }
  return url.toString();
}
