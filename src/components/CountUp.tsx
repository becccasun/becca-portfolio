"use client";
import { useEffect, useRef, useState } from "react";

// Counts from 0 to `to` once in view, easing out over ~1.6s.
export default function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current!;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now(), D = 1600;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / D);
        setN(Math.round(to * (1 - Math.pow(1 - t, 4))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);

  return <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>{n}{suffix}</span>;
}
