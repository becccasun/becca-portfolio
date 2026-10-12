"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { StampData } from "@/content";
import { settled, snap, spring, step, type Spring } from "@/lib/spring";
import Stamp, { PERFORATION_MASK } from "./Stamp";
import { TiltCard } from "./TiltCard";
import s from "./StampRow.module.css";

/*
  Four stamps in a row; click one and it lifts out of the page.

  The stamps live in a layer portalled to <body>, not inside the hero: `main` makes its
  own stacking context, and an open stamp has to sit above the header and the mascot.
  At rest the layer is `position: absolute` over the hero band (so it scrolls with the
  page) and coordinates are stage-local. While open it is `position: fixed` and
  coordinates are viewport ones; switching modes shifts every spring by the stage's
  on-screen offset so nothing jumps.

  Each stamp is drawn once at its open size (BASE_W) and scaled down for the row, so it
  is sharp in both states and the grain scales with the paper.

  Numbers are measured from the reference recording (CSS px):
    row: 130 × 160 stamps, centres 154 apart, stagger 0 / 11 / 4 / 14, tilt −2 2 −2 2
    hover: the stamp straightens to 0° (and lifts 2px)
    open: 2.2× at the centre of the screen, ~450ms, no visible overshoot
    close: back to the row in ~300ms on a stiffer spring

  Changed from the recording at Rebecca's request: while one stamp is open the others
  stay exactly where they sit in the hero (softly blurred, not regrouped at the centre
  of the screen), the open stamp gives under the pointer via TiltCard, and the page
  is flagged with html[data-stamp="open"] so the hero copy can exit downward.
*/

const BASE_W = 290;
const BASE_H = BASE_W * 1.25;
const REST_W = 130;
const REST_SCALE = REST_W / BASE_W;
const SPACING = 154;
const STAGGER = [0, 11, 4, 14];
const TILTS = [-2, 2, -2, 2];

const OPEN_K = 260, OPEN_C = 30;
const CLOSE_K = 380, CLOSE_C = 36;

type Mode = "rest" | "open" | "closing";
type Body = { x: Spring; y: Spring; s: Spring; r: Spring; blur: Spring; op: Spring };

export default function StampRow({ stamps }: { stamps: StampData[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const slots = useRef<(HTMLButtonElement | null)[]>([]);
  const [mounted, setMounted] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  // the imperative side calls into these; set inside the effect
  const api = useRef<{ open: (i: number) => void; close: () => void; hover: (i: number | null) => void }>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const st = stage.current!, ly = layer.current!, sc = scrim.current!;
    const N = stamps.length;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let mode: Mode = "rest";
    let openI: number | null = null;
    let hovered: number | null = null;
    let fit = 1; // row scale on narrow screens
    let off = { x: 0, y: 0 }; // stage's viewport offset while the layer is fixed

    const bodies: Body[] = stamps.map(() => ({
      x: spring(), y: spring(), s: spring(REST_SCALE), r: spring(), blur: spring(), op: spring(0),
    }));

    // ---- geometry ----
    const placeLayer = () => {
      if (mode !== "rest") return;
      const r = st.getBoundingClientRect();
      ly.style.position = "absolute";
      ly.style.left = `${r.left + window.scrollX}px`;
      ly.style.top = `${r.top + window.scrollY}px`;
      ly.style.width = `${r.width}px`;
      ly.style.height = `${r.height}px`;
    };
    const restOf = (i: number) => {
      const w = st.clientWidth, h = st.clientHeight;
      fit = Math.min(1, (w - 32) / (SPACING * (N - 1) + REST_W));
      return {
        x: w / 2 + (i - (N - 1) / 2) * SPACING * fit,
        y: h / 2 + (STAGGER[i % STAGGER.length] - 7) * fit,
        s: REST_SCALE * fit,
        r: TILTS[i % TILTS.length],
      };
    };

    const restTargets = () => {
      bodies.forEach((b, i) => {
        const p = restOf(i);
        const ox = mode === "rest" ? 0 : off.x, oy = mode === "rest" ? 0 : off.y;
        b.x.t = p.x + ox;
        b.y.t = p.y + oy - (hovered === i && mode === "rest" ? 2 : 0);
        b.s.t = p.s;
        b.r.t = hovered === i && mode === "rest" ? 0 : p.r;
        b.blur.t = 0;
        b.op.t = 1;
      });
    };

    const openTargets = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const big = Math.min(1, (vh * 0.62) / BASE_H, (vw * 0.82) / BASE_W);
      bodies.forEach((b, i) => {
        const p = restOf(i);
        if (i === openI) {
          b.x.t = vw / 2;
          b.y.t = vh / 2;
          b.s.t = big;
          b.r.t = 0;
          b.blur.t = 0;
          b.op.t = 1;
        } else {
          // the others stay exactly where they sit in the hero, just set back
          b.x.t = off.x + p.x;
          b.y.t = off.y + p.y;
          b.s.t = p.s;
          b.r.t = p.r;
          b.blur.t = 4;
          b.op.t = 0.55;
        }
      });
    };

    // ---- drawing ----
    const draw = () => {
      bodies.forEach((b, i) => {
        const el = slots.current[i];
        if (!el) return;
        const sc = Math.max(0.0001, b.s.x);
        el.style.transform =
          `translate(${(b.x.x - BASE_W / 2).toFixed(2)}px, ${(b.y.x - BASE_H / 2).toFixed(2)}px) ` +
          `rotate(${b.r.x.toFixed(3)}deg) scale(${sc.toFixed(4)})`;
        // blur is applied before the scale, so divide it out to get screen pixels
        const blur = b.blur.x > 0.05 ? b.blur.x / sc : 0;
        el.style.filter = blur ? `blur(${blur.toFixed(2)}px)` : "";
        el.style.opacity = b.op.x.toFixed(3);
        el.style.zIndex = i === openI ? "10" : String(i + 1);
      });
    };

    // ---- loop: alive only while something is settling ----
    let raf = 0, last = 0;
    const tick = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000 || 1 / 60);
      last = now;
      const [k, c] = mode === "closing" ? [CLOSE_K, CLOSE_C] : [OPEN_K, OPEN_C];
      let busy = false;
      for (const b of bodies) {
        for (const key of ["x", "y", "s", "r", "blur", "op"] as const) {
          const sp = b[key];
          if (settled(sp, key === "s" ? 0.0005 : 0.01)) { snap(sp); continue; }
          if (reduce) snap(sp); else step(sp, k, c, dt);
          busy = true;
        }
      }
      draw();
      if (!busy && mode === "closing") toRest();
      raf = busy ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    // ---- mode switches ----
    const shift = (dx: number, dy: number) => bodies.forEach((b) => { b.x.x += dx; b.x.t += dx; b.y.x += dy; b.y.t += dy; });

    const toFixed = () => {
      const r = st.getBoundingClientRect();
      off = { x: r.left, y: r.top };
      shift(off.x, off.y);
      ly.style.position = "fixed";
      ly.style.left = "0px";
      ly.style.top = "0px";
      ly.style.width = "100vw";
      ly.style.height = "100vh";
      ly.dataset.open = "true";
    };
    const toRest = () => {
      shift(-off.x, -off.y);
      mode = "rest";
      delete ly.dataset.open;
      placeLayer();
      draw();
      document.documentElement.style.overflow = "";
    };

    // Hidden tabs run no animation frames, so a close could stall with the page still
    // scroll-locked. Timers still fire there; this finishes the close regardless.
    let fallback = 0;
    const finishClose = () => {
      if (mode !== "closing") return;
      bodies.forEach((b) => (Object.values(b) as Spring[]).forEach(snap));
      draw();
      toRest();
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const open = (i: number) => {
      window.clearTimeout(fallback);
      if (mode === "rest") toFixed();
      mode = "open";
      openI = i;
      hovered = null;
      document.documentElement.style.overflow = "hidden";
      document.documentElement.dataset.stamp = "open";
      sc.dataset.on = "true";
      setOpenIdx(i);
      openTargets();
      wake();
    };
    const close = () => {
      if (mode !== "open") return;
      const r = st.getBoundingClientRect();
      off = { x: r.left, y: r.top };
      mode = "closing";
      const was = openI;
      openI = null;
      delete sc.dataset.on;
      delete document.documentElement.dataset.stamp;
      setOpenIdx(null);
      restTargets();
      wake();
      fallback = window.setTimeout(finishClose, 700);
      if (was !== null) slots.current[was]?.focus({ preventScroll: true });
    };
    const hover = (i: number | null) => {
      if (mode !== "rest") return;
      hovered = i;
      restTargets();
      wake();
    };
    api.current = { open, close, hover };

    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    const onResize = () => {
      if (mode === "rest") { placeLayer(); restTargets(); bodies.forEach((b) => (["x", "y", "s"] as const).forEach((k) => snap(b[k]))); draw(); }
      else if (mode === "open") { openTargets(); wake(); }
    };

    // first paint: place the row, then fade it in
    placeLayer();
    restTargets();
    bodies.forEach((b) => { snap(b.x); snap(b.y); snap(b.s); snap(b.r); });
    draw();
    wake();

    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(st);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      document.documentElement.style.overflow = "";
      delete document.documentElement.dataset.stamp;
    };
  }, [mounted, stamps]);

  return (
    <>
      <div ref={stage} className={s.stage} />
      {mounted &&
        createPortal(
          <>
            <div ref={scrim} className={s.scrim} onClick={() => api.current?.close()} aria-hidden />
            <div ref={layer} className={s.layer} role="group" aria-label="Stamps">
              {stamps.map((d, i) => (
                <button
                  key={i}
                  ref={(n) => { slots.current[i] = n; }}
                  type="button"
                  className={s.slot}
                  style={{ width: BASE_W, height: BASE_H, opacity: 0 }}
                  aria-label={`${d.name.join(" ")}, ${d.date}`}
                  aria-expanded={openIdx === i}
                  onClick={() => (openIdx === null ? api.current?.open(i) : api.current?.close())}
                  onPointerEnter={() => api.current?.hover(i)}
                  onPointerLeave={() => api.current?.hover(null)}
                  onFocus={() => api.current?.hover(i)}
                  onBlur={() => api.current?.hover(null)}
                >
                  <div className={s.face}>
                    {/* gives under the pointer only while this stamp is the open one */}
                    <TiltCard width={BASE_W} height={BASE_H} corner={0} mask={PERFORATION_MASK} active={openIdx === i} dent={false}>
                      <Stamp data={d} index={i} />
                    </TiltCard>
                  </div>
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
