// Static dot-grid background. Original 2026-05-26 version had an amber
// cursor-following spotlight (the "magic wand" effect); founder asked to
// drop the spotlight + keep the grid as a pure ambient differentiator.
// Now a plain server component, no client-side js, no pointermove handler.
export function MouseGridSpotlight() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        // faint white-ish dots every 32px, very subtle
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.06) 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }}
    />
  );
}
