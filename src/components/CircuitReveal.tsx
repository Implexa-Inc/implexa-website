import { useEffect, useRef } from "react";

/**
 * Developer-friendly "wand" reveal.
 * - Faint grid of small grey squares fills the viewport.
 * - As the cursor moves, squares within a soft radius "light up" in
 *   green / white / grey tones at varying intensities, like terminal
 *   pixels turning on and off.
 */
export function CircuitReveal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctxMaybe = canvas.getContext("2d");
    if (!ctxMaybe) return;
    const ctx: CanvasRenderingContext2D = ctxMaybe;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const CELL = 18;       // square cell spacing
    const SIZE = 12;       // square size (slightly smaller than cell)
    const REVEAL_R = 170;  // wand radius in CSS px

    type Tile = { x: number; y: number; seed: number; flicker: number };
    let tiles: Tile[] = [];

    function build() {
      tiles = [];
      const cols = Math.ceil(w / CELL) + 1;
      const rows = Math.ceil(h / CELL) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          tiles.push({
            x: c * CELL,
            y: r * CELL,
            seed: Math.random(),
            flicker: Math.random() * Math.PI * 2,
          });
        }
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    const onMove = (e: MouseEvent) => { mouse.tx = e.clientX; mouse.ty = e.clientY; };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]; if (!t) return;
      mouse.tx = t.clientX; mouse.ty = t.clientY;
    };
    const onLeave = () => { mouse.tx = -9999; mouse.ty = -9999; };

    let raf = 0;
    const draw = (t: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.2;
      mouse.y += (mouse.ty - mouse.y) * 0.2;

      ctx.clearRect(0, 0, w, h);

      const r2 = REVEAL_R * REVEAL_R;
      const time = t * 0.003;

      for (const tile of tiles) {
        const dx = tile.x - mouse.x;
        const dy = tile.y - mouse.y;
        const d2 = dx * dx + dy * dy;

        // Base: very faint grey square (always visible)
        const baseAlpha = 0.04 + tile.seed * 0.02;
        ctx.fillStyle = `rgba(230, 230, 230, ${baseAlpha})`;
        ctx.fillRect(tile.x, tile.y, SIZE, SIZE);

        if (d2 > r2) continue;

        // Falloff 0..1
        const falloff = 1 - Math.sqrt(d2) / REVEAL_R;
        // Some tiles "off" (skip lighting) so the grid feels alive
        const onChance = tile.seed * 0.85 + 0.15;
        if (Math.random() > onChance * 0.6 + 0.4) {
          // occasional skipped frame for flicker
        }

        // Flicker factor
        const flick = 0.55 + 0.45 * Math.sin(time * (1 + tile.seed * 2) + tile.flicker);
        const intensity = falloff * flick;

        // Color: ~70% green, ~25% white, ~5% bright ember-white
        let color: string;
        if (tile.seed < 0.7) {
          // green developer terminal
          const a = 0.15 + intensity * 0.75;
          color = `rgba(74, 222, 128, ${a})`;
        } else if (tile.seed < 0.95) {
          // white
          const a = 0.1 + intensity * 0.6;
          color = `rgba(245, 245, 245, ${a})`;
        } else {
          // muted grey highlight
          const a = 0.1 + intensity * 0.45;
          color = `rgba(180, 180, 180, ${a})`;
        }
        ctx.fillStyle = color;
        ctx.fillRect(tile.x, tile.y, SIZE, SIZE);
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
