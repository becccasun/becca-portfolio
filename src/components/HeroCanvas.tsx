"use client";
import { useEffect, useRef } from "react";

// Soft grey smudge that trails the pointer across the hero and fades out.
export default function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pts: { x: number; y: number; t: number }[] = [];
    let raf = 0;
    let last: { x: number; y: number } | null = null;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (y < 0 || y > r.height) { last = null; return; }
      // Fill gaps so fast moves still draw a continuous stroke.
      if (last) {
        const d = Math.hypot(x - last.x, y - last.y);
        const steps = Math.min(20, Math.floor(d / 12));
        for (let i = 1; i < steps; i++) {
          pts.push({ x: last.x + ((x - last.x) * i) / steps, y: last.y + ((y - last.y) * i) / steps, t: performance.now() });
        }
      }
      pts.push({ x, y, t: performance.now() });
      last = { x, y };
      wake();
    };
    window.addEventListener("pointermove", onMove);

    const LIFE = 1400, R = 70;
    const tick = () => {
      const now = performance.now();
      while (pts.length && now - pts[0].t > LIFE) pts.shift();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pts) {
        const k = 1 - (now - p.t) / LIFE;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
        g.addColorStop(0, `rgba(0,0,0,${0.018 * k})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(p.x - R, p.y - R, R * 2, R * 2);
      }
      // Once the trail has faded the canvas is blank, so stop drawing until the
      // pointer moves again (it used to clear an empty canvas every frame, forever).
      raf = pts.length ? requestAnimationFrame(tick) : 0;
    };
    function wake() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "blur(12px)" }} />;
}
