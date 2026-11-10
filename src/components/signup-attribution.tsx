"use client";

import { useEffect } from "react";
import {
  decorateSignupHref,
  firstTouchFrom,
  type FirstTouch,
} from "@/lib/signup-attribution";

const STORAGE_KEY = "implexa_first_touch";

// Mounted once in the root layout. Records the visit's first page, then adds
// it to any sign-up link the visitor clicks (see lib/signup-attribution.ts).
export function SignupAttribution() {
  useEffect(() => {
    let touch: FirstTouch | null = null;
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        touch = JSON.parse(saved) as FirstTouch;
      } else {
        touch = firstTouchFrom(window.location, document.referrer);
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(touch));
      }
    } catch {
      // Storage blocked: attribute to the current page instead.
      touch = firstTouchFrom(window.location, document.referrer);
    }

    // Capture phase, before navigation reads the href. auxclick covers
    // middle-click "open in new tab".
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const next = decorateSignupHref(anchor.href, touch, window.location.pathname);
      if (next) anchor.href = next;
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, []);

  return null;
}
