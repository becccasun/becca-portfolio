"use client";
import { useEffect, useRef, useState } from "react";
import { withBase } from "@/lib/base";
import s from "./HoverClip.module.css";

// An always-playing muted loop that never holds up the page: its first frame shows straight away, and the clip
// itself only starts downloading once the page has finished loading and the card is near the screen
// (a hidden copy, like the phone layout on desktop, never downloads it). It fades in over the still once it plays.
export default function LoopClip({ src, poster, alt }: { src: string; poster: string; alt: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let near = false, loaded = document.readyState === "complete";
    const go = () => { if (near && loaded) setLoad(true); };
    const onLoad = () => { loaded = true; go(); };
    if (!loaded) window.addEventListener("load", onLoad, { once: true });
    const io = new IntersectionObserver(([e]) => { near = e.isIntersecting; go(); }, { rootMargin: "300px 0px" });
    io.observe(el);
    return () => { io.disconnect(); window.removeEventListener("load", onLoad); };
  }, []);

  return (
    <div ref={box} className={s.box} data-playing={playing || undefined} style={{ height: "100%" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={withBase(poster)} alt={alt} suppressHydrationWarning />
      {load && (
        <video className={s.clip} src={withBase(src)} autoPlay muted loop playsInline onPlaying={() => setPlaying(true)} aria-hidden />
      )}
    </div>
  );
}
