"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { withBase } from "@/lib/base";
import type { Pose } from "./canvas3d";
import { canvasFit } from "./canvasFit";
import s from "./ArtCanvas.module.css";

// A painting as a stretched canvas you can turn all the way round. three.js loads only when a card nears
// the viewport, and each card frees its WebGL context once it's well out of view (the pose is kept).
// long: the canvas's longer side in inches; depth: its profile in inches.
export default function ArtCanvas({ src, w, h, long, depth, label }: { src: string; w: number; h: number; long: number; depth: number; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  // Every canvas starts painting-side out, each a few degrees apart so the column isn't turning in lockstep
  const pose = useRef<Pose>({ yaw: -0.38 + (([...src].reduce((a, c) => a + c.charCodeAt(0), 0) % 7) - 3) * 0.08, pitch: 0.1 });
  const [ready, setReady] = useState(false);
  const aspect = w / h;
  // Room the canvas can swing into: the drawing surface overhangs the slot by this much, and the card
  // keeps the same room clear above and below so neighbouring paintings never cut it off.
  const fit = useMemo(() => canvasFit(aspect, long, depth), [aspect, long, depth]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let unmount: (() => void) | null = null;
    let wanted = false;
    let gen = 0; // bumps on every enter/leave so a slow module load can't mount after the card has left
    const leave = () => { gen++; wanted = false; unmount?.(); unmount = null; setReady(false); };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !wanted) {
        wanted = true;
        const my = ++gen;
        import("./canvas3d").then(({ mountCanvas }) => {
          if (my !== gen) return;
          unmount = mountCanvas(el, { src: withBase(src), aspect, long, depth }, pose.current, () => setReady(true));
        });
      } else if (!e.isIntersecting && wanted) leave();
    }, { rootMargin: "400px 0px" });
    io.observe(el);
    return () => { io.disconnect(); leave(); };
  }, [src, aspect, long, depth]);

  return (
    <div
      ref={host}
      className={s.stage}
      data-ready={ready || undefined}
      style={{
        aspectRatio: aspect,
        "--ox": `${fit.x * 100}%`,
        "--oy": `${fit.y * 100}%`,
        // vertical margins resolve against the width, so convert the height share with the aspect
        "--room": `${(fit.y / aspect) * 100}%`,
      } as React.CSSProperties}
      role="img"
      aria-label={`${label}. Use the arrow keys to turn the canvas.`}
      tabIndex={0}
    />
  );
}
