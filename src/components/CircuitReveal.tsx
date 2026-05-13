import { useEffect, useRef } from "react";

/**
 * Full-viewport "magic wand" reveal.
 * - A subtle grid of tiny grey tiles fills the background.
 * - A hidden orthogonal wiring graph (in the brand flame color) is only
 *   visible within a soft radial spotlight around the cursor.
 * - Pure canvas, fixed-position, pointer-events: none.
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

    // Offscreen layer for the pre-rendered wiring (so we only redraw the mask each frame)
    const wiringCanvas = document.createElement("canvas");
    const wctx = wiringCanvas.getContext("2d")!;

    // Composition canvas for masked wiring
    const maskCanvas = document.createElement("canvas");
    const mctx = maskCanvas.getContext("2d")!;

    const TILE = 22;          // grey tile spacing
    const CELL = 44;          // wiring grid cell
    const NODE_R = 3;         // junction node radius
    const REVEAL_R = 180;     // spotlight radius (CSS px)

    type Edge = { x1: number; y1: number; x2: number; y2: number };
    let edges: Edge[] = [];
    let nodes: { x: number; y: number }[] = [];

    // Build a sparse orthogonal "circuit" — random walks along a grid.
    function buildCircuit() {
      edges = [];
      nodes = [];
      const cols = Math.ceil(w / CELL) + 1;
      const rows = Math.ceil(h / CELL) + 1;
      const visited = new Set<string>();
      const key = (c: number, r: number) => `${c},${r}`;

      // Number of trace "wires" scales with screen area
      const wireCount = Math.max(8, Math.floor((cols * rows) / 35));

      for (let i = 0; i < wireCount; i++) {
        let c = Math.floor(Math.random() * cols);
        let r = Math.floor(Math.random() * rows);
        const len = 6 + Math.floor(Math.random() * 14);
        let prevDir = -1;
        for (let s = 0; s < len; s++) {
          // Pick a direction; prefer not to immediately reverse
          const dirs = [0, 1, 2, 3].filter((d) => d !== (prevDir ^ 1));
          const dir = dirs[Math.floor(Math.random() * dirs.length)];
          const dc = dir === 0 ? 1 : dir === 1 ? -1 : 0;
          const dr = dir === 2 ? 1 : dir === 3 ? -1 : 0;
          const nc = c + dc;
          const nr = r + dr;
          if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) break;
          const x1 = c * CELL;
          const y1 = r * CELL;
          const x2 = nc * CELL;
          const y2 = nr * CELL;
          const ek = `${Math.min(x1, x2)},${Math.min(y1, y2)},${Math.max(x1, x2)},${Math.max(y1, y2)}`;
          if (!visited.has(ek)) {
            visited.add(ek);
            edges.push({ x1, y1, x2, y2 });
          }
          c = nc;
          r = nr;
          prevDir = dir;
          // Occasionally drop a node at the junction
          if (Math.random() < 0.35) nodes.push({ x: x2, y: y2 });
        }
      }
    }

    function renderWiring() {
      wiringCanvas.width = w * dpr;
      wiringCanvas.height = h * dpr;
      wctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      wctx.clearRect(0, 0, w, h);

      // Glow underlay
      wctx.lineCap = "round";
      wctx.strokeStyle = "rgba(255, 138, 60, 0.35)";
      wctx.lineWidth = 4;
      wctx.shadowColor = "rgba(255, 138, 60, 0.7)";
      wctx.shadowBlur = 10;
      for (const e of edges) {
        wctx.beginPath();
        wctx.moveTo(e.x1, e.y1);
        wctx.lineTo(e.x2, e.y2);
        wctx.stroke();
      }

      // Crisp core line
      wctx.shadowBlur = 0;
      wctx.strokeStyle = "rgba(255, 180, 110, 0.95)";
      wctx.lineWidth = 1.25;
      for (const e of edges) {
        wctx.beginPath();
        wctx.moveTo(e.x1, e.y1);
        wctx.lineTo(e.x2, e.y2);
        wctx.stroke();
      }

      // Nodes
      wctx.fillStyle = "rgba(255, 217, 61, 1)";
      wctx.shadowColor = "rgba(255, 138, 60, 0.9)";
      wctx.shadowBlur = 8;
      for (const n of nodes) {
        wctx.beginPath();
        wctx.arc(n.x, n.y, NODE_R, 0, Math.PI * 2);
        wctx.fill();
      }
      wctx.shadowBlur = 0;
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

      maskCanvas.width = w * dpr;
      maskCanvas.height = h * dpr;
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildCircuit();
      renderWiring();
    }

    // Mouse / touch tracking — start off-screen so nothing reveals until interaction
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    const onMove = (e: MouseEvent) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      mouse.tx = t.clientX;
      mouse.ty = t.clientY;
    };
    const onLeave = () => {
      mouse.tx = -9999;
      mouse.ty = -9999;
    };

    let raf = 0;
    const draw = () => {
      // Smooth follow
      mouse.x += (mouse.tx - mouse.x) * 0.18;
      mouse.y += (mouse.ty - mouse.y) * 0.18;

      ctx.clearRect(0, 0, w, h);

      // 1) Grey tile dots
      ctx.fillStyle = "rgba(255, 245, 230, 0.055)";
      for (let y = TILE / 2; y < h; y += TILE) {
        for (let x = TILE / 2; x < w; x += TILE) {
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // 2) Build masked wiring on offscreen canvas: copy wiring then mask
      mctx.save();
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mctx.clearRect(0, 0, w, h);
      mctx.drawImage(wiringCanvas, 0, 0, w, h);
      mctx.globalCompositeOperation = "destination-in";
      const grad = mctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        REVEAL_R
      );
      grad.addColorStop(0, "rgba(0,0,0,1)");
      grad.addColorStop(0.55, "rgba(0,0,0,0.7)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      mctx.fillStyle = grad;
      mctx.fillRect(0, 0, w, h);
      mctx.restore();

      // 3) Composite revealed wiring onto main canvas
      ctx.drawImage(maskCanvas, 0, 0, w, h);

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
      style={{ mixBlendMode: "screen" }}
    />
  );
}
