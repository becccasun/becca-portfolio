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
// Until the 3D view is up, a flat copy of the painting sits exactly where the canvas's front face will be at
// rest, so the column is never empty; the 3D canvas fades in over it, starting from that same front-on pose.

// Start fetching the 3D module as soon as the page runs, rather than when the first card scrolls near
const load3d = () => import("./canvas3d");
if (typeof window !== "undefined") load3d();

export default function ArtCanvas({ src, w, h, long, depth, label }: { src: string; w: number; h: number; long: number; depth: number; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  // Front-on, matching the flat stand-in; kept across unmounts so a canvas picks up where it was
  const pose = useRef<Pose>({ yaw: 0, pitch: 0, fresh: true });
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
        load3d().then(({ mountCanvas }) => {
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
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={s.poster} src={withBase(src)} alt="" style={{ inset: `${((1 - fit.fill) / 2) * 100}%`, width: `${fit.fill * 100}%`, height: `${fit.fill * 100}%` }} draggable={false} suppressHydrationWarning />
    </div>
  );
}
