"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type React from "react";
import { withBase } from "@/lib/base";
import s from "./FlipBook.module.css";

// A printed notebook lying flat, seen from above. Click the right page to turn forward, the left page to turn back.
// No zoom, no drag, no wheel handling: scrolling passes straight through to the column.
// Pages live in /play/books/<slug>/001.webp … NNN.webp (page 1 is the cover, the last page the back cover).
// Each leaf is one sheet of paper: its front is an odd page (right side), its back the next even page (left side).
//
// Motion is driven frame by frame rather than by CSS transitions, so every part reads the same angle:
// - a leaf's stacking follows how high it is off the book (the one nearest vertical is on top), so a page
//   never pops in front of the pages it should still be under;
// - the paper block under the leaves only covers where paper actually lies, and the book recentres as the
//   pages land, so nothing slides out from under a page that is still in the air;
// - closing turns the whole left stack over together as one block, a few ms apart to show its thickness.

const TURN_MS = 900;
const CLOSE_MS = 1100;
const CLOSE_STAGGER = 10; // ms between sheets of the closing block: just enough to show its thickness
const BLOCK_EDGE = 3; // sheets animated at each end of the block; the middle of a thick block isn't visible anyway
const WINDOW = 3; // leaves kept mounted on each side of the open spread

const pad = (n: number) => String(n).padStart(3, "0");

type Anim = { from: number; to: number; start: number; dur: number }; // angles in degrees: 0 = flat right, 180 = flat left

// Same feel as the old cubic-bezier(0.45, 0.05, 0.25, 1): a slow lift, a quick fall, a soft landing
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function FlipBook({ slug, pages, title }: { slug: string; pages: number; title: string }) {
  const leaves = Math.ceil(pages / 2);
  const [spread, setSpread] = useState(0); // 0 = closed on the cover, leaves = closed on the back
  const at = useRef(0); // the spread, readable from timers
  const anims = useRef(new Map<number, Anim>());
  const held = useRef(new Set<number>()); // leaves that must stay mounted until the current motion settles
  const [, setTick] = useState(0); // re-render when the set of moving leaves changes
  const leafEls = useRef(new Map<number, HTMLDivElement>());
  const bookRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  // Autoplay: while nobody is reading, the book turns a few pages on its own, then closes again.
  // Hovering (or a first tap) closes it back to the cover; after a reader's first click it stays theirs.
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const swallowClick = useRef(false);

  const angleOf = (j: number, now: number) => {
    const a = anims.current.get(j);
    if (!a) return j < at.current ? 180 : 0;
    const t = Math.min(1, Math.max(0, (now - a.start) / a.dur));
    return a.from + (a.to - a.from) * ease(t);
  };

  // Write the current pose of every mounted leaf, the paper block and the book's position
  const paint = (now: number) => {
    let left = 0, right = 0; // how much paper lies on each side, 0–1 of a page (drives the block under the leaves)
    let leftC = 0, rightC = 0; // the same, eased, for recentring the book
    const spreadNow = at.current;
    for (let j = 0; j < spreadNow; j++) if (!anims.current.has(j)) { left = leftC = 1; break; }
    for (let j = spreadNow; j < leaves; j++) if (!anims.current.has(j)) { right = rightC = 1; break; }
    for (const j of anims.current.keys()) {
      const th = (angleOf(j, now) * Math.PI) / 180, c = Math.cos(th), p = (1 - c) / 2;
      left = Math.max(left, -c); right = Math.max(right, c);
      leftC = Math.max(leftC, p); rightC = Math.max(rightC, 1 - p);
    }
    for (const [j, el] of leafEls.current) {
      const th = angleOf(j, now);
      const moving = anims.current.has(j);
      el.style.transform = `rotateY(${-th}deg)`;
      // Static leaves stack as paper does; moving ones sit above them, highest off the book on top
      el.style.zIndex = String(moving ? 10000 - Math.round(Math.abs(th - 90) * 10) : th > 90 ? 1 + j : 2 * leaves - j);
      el.style.setProperty("--lift", moving ? Math.sin((th * Math.PI) / 180).toFixed(3) : "0");
    }
    if (baseRef.current) {
      baseRef.current.style.left = `${50 - left * 50}%`;
      baseRef.current.style.right = `${50 - right * 50}%`;
    }
    if (bookRef.current) bookRef.current.style.translate = `${((leftC - rightC) / 4) * 100}% -50%`;
  };

  const run = () => {
    cancelAnimationFrame(raf.current);
    const frame = () => {
      const now = performance.now();
      let done = false;
      for (const [j, a] of anims.current) if (now >= a.start + a.dur) { anims.current.delete(j); done = true; }
      paint(now);
      if (anims.current.size) raf.current = requestAnimationFrame(frame);
      else { held.current.clear(); }
      if (done) setTick((t) => t + 1);
    };
    raf.current = requestAnimationFrame(frame);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const hold = (around: number) => {
    for (let j = Math.max(0, around - WINDOW); j < Math.min(leaves, around + WINDOW); j++) held.current.add(j);
  };

  // Start (or redirect) one sheet towards a side. A sheet already in the air turns from where it is.
  const move = (j: number, to: number, dur: number, delay = 0) => {
    const now = performance.now();
    const from = angleOf(j, now);
    if (from === to && !anims.current.has(j)) return;
    anims.current.set(j, { from, to, start: now + delay, dur: reduced() ? 1 : dur * Math.max(0.35, Math.abs(to - from) / 180) });
  };

  const turn = (dir: 1 | -1) => {
    const next = at.current + dir;
    if (next < 0 || next > leaves) return;
    hold(at.current);
    move(dir === 1 ? at.current : at.current - 1, dir === 1 ? 180 : 0, TURN_MS);
    at.current = next;
    setSpread(next);
    run();
  };

  // Close back to the cover: the whole left stack turns over together, top sheet leading
  const toCover = () => {
    const from = at.current;
    if (from === 0) return;
    hold(from);
    const sheets = new Set<number>();
    for (let k = 0; k < Math.min(BLOCK_EDGE, from); k++) sheets.add(from - 1 - k);
    for (let k = Math.min(BLOCK_EDGE, from) - 1; k >= 0; k--) sheets.add(k);
    [...sheets].forEach((j, i) => move(j, 0, CLOSE_MS, i * CLOSE_STAGGER));
    // Sheets between the two ends of a thick block jump straight to the right side, hidden under the block
    for (const j of [...anims.current.keys()]) if (!sheets.has(j) && j < from) anims.current.delete(j);
    at.current = 0;
    setSpread(0);
    run();
  };

  useLayoutEffect(() => { paint(performance.now()); });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || hover || engaged || reduced()) return;
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(setTimeout(r, ms)));
    (async () => {
      await wait(900);
      while (alive) {
        for (let i = 0; i < 3 && alive; i++) { turn(1); await wait(1500); }
        if (!alive) break;
        await wait(800);
        toCover();
        await wait(CLOSE_MS + BLOCK_EDGE * 2 * CLOSE_STAGGER + 1800);
      }
    })();
    return () => { alive = false; timers.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, hover, engaged]);

  const onEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    setHover(true);
    if (!engaged) toCover();
  };
  const onLeave = (e: React.PointerEvent) => { if (e.pointerType === "mouse") setHover(false); };
  // Touch has no hover: the first tap during autoplay closes the book instead of turning a page
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" || engaged) return;
    setEngaged(true);
    swallowClick.current = true;
    toCover();
  };
  const click = (dir: 1 | -1) => {
    if (swallowClick.current) { swallowClick.current = false; return; }
    setEngaged(true);
    turn(dir);
  };

  const src = (page: number) => withBase(`/play/books/${slug}/${pad(page)}.webp`);

  const mounted: number[] = [];
  for (let j = 0; j < leaves; j++) {
    if ((j >= spread - WINDOW && j < spread + WINDOW) || anims.current.has(j) || held.current.has(j)) mounted.push(j);
  }

  const closedFront = spread === 0;
  const closedBack = spread === leaves;
  const left = spread * 2; // page number showing on the left, if any
  const status = closedFront ? `Cover of ${title}` : closedBack ? `Back cover of ${title}` : `Pages ${left} and ${left + 1} of ${pages}`;

  const leafRef = (j: number) => (el: HTMLDivElement | null) => {
    if (el) leafEls.current.set(j, el);
    else leafEls.current.delete(j);
  };

  return (
    <div ref={stageRef} className={s.stage} onPointerEnter={onEnter} onPointerLeave={onLeave} onPointerDown={onDown}>
      <div ref={bookRef} className={s.book}>
        <div ref={baseRef} className={s.base} aria-hidden />
        {mounted.map((j) => {
          const front = 2 * j + 1;
          const back = 2 * j + 2;
          // the cover and anything near the open spread load straight away, so a turning page is never blank
          const eager = j === 0 || Math.abs(j - spread) <= 1;
          return (
            <div key={j} ref={leafRef(j)} className={s.leaf} aria-hidden>
              <div className={`${s.face} ${s.front}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src(front)} alt="" loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />
              </div>
              <div className={`${s.face} ${s.back}`}>
                {back <= pages && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src(back)} alt="" loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />
                )}
              </div>
            </div>
          );
        })}
        <button type="button" className={`${s.hit} ${s.hitLeft}`} aria-label="Previous page" disabled={closedFront} onClick={() => click(-1)} />
        <button type="button" className={`${s.hit} ${s.hitRight}`} aria-label="Next page" disabled={closedBack} onClick={() => click(1)} />
      </div>
      <p className="sr-only" aria-live="polite">{status}</p>
    </div>
  );
}
