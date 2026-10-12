"use client";
import { useEffect, useRef } from "react";

// Fixed "dappled light" layer. Same filter chain as the original: turbulence →
// hue-rotated colour matrix → double displacement, with the hue rotation animated so
// the shapes undulate. The source shapes are our own soft diagonal blades.
//
// Performance: the filter is the most expensive thing on the page, so
//   · it only animates while it's actually visible (it's fully transparent at the top
//     of the page, where everyone lands) and the tab is in view;
//   · it re-renders ~20 times a second rather than every frame — the drift is slow;
//   · it renders at half resolution and is scaled up 2× (it's heavily blurred anyway),
//     so each re-render touches a quarter of the pixels. Every length inside is halved
//     to match, so it looks the same.
const FPS = 20;

export default function ShadowOverlay() {
  const wrap = useRef<HTMLDivElement>(null);
  const hue = useRef<SVGFEColorMatrixElement>(null);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    let visible = false;
    // Paused while the page is scrolling: re-rendering a full-screen SVG filter during
    // the works drawer pull made scrolling stutter. It picks up again once scrolling stops.
    let scrolling = false;
    let idle = 0;
    const start = performance.now();

    const tick = (now: number) => {
      if (now - last >= 1000 / FPS) {
        last = now;
        hue.current?.setAttribute("values", String((((now - start) / 1000) * 36) % 360));
      }
      raf = requestAnimationFrame(tick);
    };
    const play = () => {
      const should = visible && !scrolling && document.visibilityState === "visible";
      if (should && !raf) raf = requestAnimationFrame(tick);
      if (!should && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    // Fades in over the first viewport and stays at ~0.22 afterwards.
    const onScroll = () => {
      const k = Math.min(1, window.scrollY / (window.innerHeight * 0.9));
      if (wrap.current) wrap.current.style.opacity = String(0.225 * k);
      visible = k > 0.02;
      scrolling = true;
      clearTimeout(idle);
      idle = window.setTimeout(() => {
        scrolling = false;
        play();
      }, 180);
      play();
    };
    onScroll();
    clearTimeout(idle);
    scrolling = false;
    play();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", play);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", play);
    };
  }, []);

  return (
    <div ref={wrap} aria-hidden style={{ position: "fixed", inset: 0, zIndex: 4, pointerEvents: "none", overflow: "hidden", opacity: 0 }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          {/* frequencies doubled and displacement halved for the half-size render */}
          <filter id="dapple" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence result="undulation" numOctaves="2" baseFrequency="0.0015,0.006" seed="0" type="turbulence" />
            <feColorMatrix ref={hue} in="undulation" type="hueRotate" values="0" />
            <feColorMatrix in="dist" result="circulation" type="matrix" values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0" />
            <feDisplacementMap in="SourceGraphic" in2="circulation" scale="30" result="dist" />
            <feDisplacementMap in="dist" in2="undulation" scale="30" result="output" />
          </filter>
        </defs>
      </svg>
      {/* half-size, scaled 2× from the top-left: covers the viewport plus a 60px margin */}
      <div
        style={{
          position: "absolute", left: -60, top: -60,
          width: "calc(50vw + 60px)", height: "calc(50vh + 60px)",
          transform: "scale(2)", transformOrigin: "0 0",
          filter: "url(#dapple) blur(2px)",
        }}
      >
        <div
          style={{
            position: "absolute", inset: 0, filter: "blur(14px)",
            background:
              "repeating-linear-gradient(118deg, transparent 0 110px, rgba(0,0,0,0.28) 150px 170px, transparent 210px 320px)," +
              "radial-gradient(40% 30% at 20% 30%, rgba(0,0,0,0.18), transparent 70%)," +
              "radial-gradient(35% 45% at 85% 70%, rgba(0,0,0,0.16), transparent 70%)",
            maskImage: "radial-gradient(120% 90% at 70% 40%, #000 30%, transparent 85%)",
            WebkitMaskImage: "radial-gradient(120% 90% at 70% 40%, #000 30%, transparent 85%)",
          }}
        />
      </div>
    </div>
  );
}
