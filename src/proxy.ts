import { NextResponse, type NextRequest } from "next/server";

/**
 * Homepage hero A/B: assign a sticky 50/50 variant cookie so the server can
 * render the assigned headline on the FIRST paint (flash-free, and without
 * biasing every first impression to variant "a"). Once set, it sticks for 180
 * days, so a returning visitor always sees the same headline.
 *
 * We set the cookie on the request too (NextResponse.next({ request })) so this
 * same request's server render can read it via cookies() and pass it to
 * <HeroHeadline forced=...>. Scoped to "/" only via the matcher below.
 *
 * Uses the "proxy" file convention (the renamed-from-middleware convention in
 * this Next fork).
 */

const COOKIE = "implexa_hero_variant";

export function proxy(request: NextRequest) {
  const existing = request.cookies.get(COOKIE)?.value;

  // A/B PAUSED: the founder chose headline A. A live 50/50 split made the hero
  // differ across devices (one phone on "b", desktop on "a"), which reads as
  // "the mobile site didn't update." Force every visitor to "a" for a single,
  // consistent headline, and OVERWRITE any sticky "b" cookie from the prior
  // test so returning visitors flip to A on their next load.
  // To resume a real test, restore: existing in {a,b} ? existing : random().
  const variant = "a";

  // Make the assignment visible to this request's render.
  request.cookies.set(COOKIE, variant);
  const res = NextResponse.next({ request });

  // Persist whenever the browser's stored value isn't already "a" (covers both
  // unset and a leftover "b" from the paused test).
  if (existing !== variant) {
    res.cookies.set(COOKIE, variant, {
      path: "/",
      maxAge: 60 * 60 * 24 * 180,
      sameSite: "lax",
    });
  }
  return res;
}

export const config = { matcher: ["/"] };
