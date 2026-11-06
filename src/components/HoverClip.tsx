"use client";
import { useEffect, useRef, useState } from "react";
import type React from "react";
import { withBase } from "@/lib/base";
import s from "./HoverClip.module.css";

// A still that turns into a short clip while its card is hovered (or tapped, on touch), then rests on the still again.
// The clip only downloads once someone shows interest, so a resting card costs one image.
export default function HoverClip({ src, clip, alt, className, style }: { src: string; clip: string; alt: string; className?: string; style?: React.CSSProperties }) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const card = box.current?.parentElement;
    const v = video.current;
    if (!card) return;
    const start = () => {
      setLoad(true);
      setPlaying(true);
      const el = video.current;
      if (el) { el.currentTime = 0; el.play().catch(() => {}); }
    };
    const stop = () => {
      setPlaying(false);
      const el = video.current;
      if (el) { el.pause(); el.currentTime = 0; }
    };
    const enter = (e: PointerEvent) => { if (e.pointerType === "mouse") start(); };
    const leave = (e: PointerEvent) => { if (e.pointerType === "mouse") stop(); };
    const tap = (e: PointerEvent) => { if (e.pointerType !== "mouse") (video.current && !video.current.paused ? stop : start)(); };
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    card.addEventListener("pointerup", tap);
    return () => {
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointerleave", leave);
      card.removeEventListener("pointerup", tap);
      v?.pause();
    };
  }, []);

  // The first hover mounts the source; start playing as soon as there's something to play
  useEffect(() => {
    if (load && playing) video.current?.play().catch(() => {});
  }, [load, playing]);

  return (
    <div ref={box} className={`${className ?? ""} ${s.box}`} style={style} data-playing={playing || undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={withBase(src)} alt={alt} loading="lazy" suppressHydrationWarning />
      <video ref={video} className={s.clip} src={load ? withBase(clip) : undefined} muted loop playsInline preload="none" aria-hidden />
    </div>
  );
}
