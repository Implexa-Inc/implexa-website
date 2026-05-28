import { fetchSkillScore } from "@/lib/skill-score";

// shields.io-style SkillRank badge. authors embed this in github readmes
// + personal sites via markdown:
//
//   [![SkillRank 7.9](https://implexa.ai/badge/skills.sh/foo.svg)](https://implexa.ai/s/skills.sh/foo)
//
// github proxies through camo.githubusercontent.com which caches for ~24h
// and respects upstream cache-control, so set max-age aggressively.
//
// design goals:
// - tiny payload (<2kb per badge, no font deps, inline template strings)
// - never break a readme: bad input / missing score / upstream timeout
//   all render a valid svg, never 4xx/5xx with html
// - dofollow backlink to /s/<source>/<slug> via the wrapping markdown link
//   is the entire seo play. the svg itself just needs to render

// keep the param value path-safe. matches the canon for source + slug across
// the rest of the site (skills.sh, anthropic, clawhub, kebab-case slugs).
// reject anything else with a graceful 400 svg so we don't 500 on garbage.
const SAFE_RE = /^[a-z0-9._-]+$/i;

type Tier = { fill: string; text: string };

// color band by score. matches the leaderboard scoreColor() intent but tuned
// for badge legibility (light fills get dark text).
//
// 2026-05-28: lowered the emerald threshold from 9.0 to 8.0 and added a
// distinct "top tier" green for 8.0-8.9. The previous version reserved
// emerald only for 9.0+ which, in practice, meant only our 8 curated
// implexa skills hit the green tier — every organic author scoring 7-8.9
// got a badge that looked indistinguishable from a 5.0 dud. Bad for
// outreach: authors should feel rewarded by their badge color.
function tierFor(score: number | null): Tier {
  if (score === null) return { fill: "#52525b", text: "#fff" }; // zinc-600, unrated
  if (score >= 9.0) return { fill: "#10b981", text: "#fff" }; // emerald-500, elite (~0.5%)
  if (score >= 8.0) return { fill: "#16a34a", text: "#fff" }; // green-600, top tier (~3%)
  if (score >= 7.0) return { fill: "#3f3f46", text: "#d4d4d8" }; // zinc-700/zinc-300, good
  if (score >= 5.0) return { fill: "#f59e0b", text: "#fff" }; // amber-500, average
  return { fill: "#71717a", text: "#fff" }; // zinc-500, low
}

// approximate the text width shields.io uses for its default font: ~7px per
// glyph at 11px font-size + 10px horizontal padding on each side. fine for
// monospace numerics + the literal "SkillRank" label, not perfect for proportional
// fonts but the rounded ends mask the slack.
function textWidth(s: string): number {
  return s.length * 7 + 20;
}

function badgeSvg(rightLabel: string, tier: Tier): string {
  const left = "SkillRank";
  const leftW = textWidth(left);
  const rightW = textWidth(rightLabel);
  const totalW = leftW + rightW;
  const leftCx = leftW / 2;
  const rightCx = leftW + rightW / 2;
  const ariaLabel = `SkillRank: ${rightLabel}`;

  // inline. no library, no external fonts. geist mono first (the site loads
  // it elsewhere), then dejavu sans mono for github's render context, then
  // generic monospace. github strips style/script from svgs anyway so this
  // stays defensive.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="20" role="img" aria-label="${ariaLabel}">
  <title>${ariaLabel}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${totalW}" height="20" rx="3"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${leftW}" height="20" fill="#27272a"/>
    <rect x="${leftW}" width="${rightW}" height="20" fill="${tier.fill}"/>
    <rect width="${totalW}" height="20" fill="url(#s)"/>
  </g>
  <g font-family="Geist Mono,DejaVu Sans Mono,Menlo,Consolas,monospace" font-size="11" text-anchor="middle">
    <text x="${leftCx}" y="14" fill="#fff">${left}</text>
    <text x="${rightCx}" y="14" fill="${tier.text}">${rightLabel}</text>
  </g>
</svg>`;
}

function svgResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      // camo refreshes ~daily; let it serve a stale badge for a week if the
      // origin ever hiccups, then revalidate in the background.
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ source: string; slug: string }> },
): Promise<Response> {
  const { source, slug: rawSlug } = await ctx.params;
  // next strips the literal .svg suffix off the dynamic segment, but if a
  // weird routing edge case ever leaves it on the value, drop it so the
  // backend lookup matches the canonical slug.
  const slug = rawSlug.replace(/\.svg$/i, "");

  if (!SAFE_RE.test(source) || !SAFE_RE.test(slug)) {
    // 400 but still a valid svg so a typo in a readme doesn't show a broken
    // image. github + camo both render this.
    return svgResponse(
      badgeSvg("invalid", { fill: "#71717a", text: "#fff" }),
      400,
    );
  }

  const score = await fetchSkillScore(source, slug);

  const display =
    score &&
    score.scored === true &&
    typeof score.display_score === "number" &&
    !Number.isNaN(score.display_score)
      ? score.display_score
      : null;

  const label = display === null ? "unrated" : display.toFixed(1);
  return svgResponse(badgeSvg(label, tierFor(display)));
}
