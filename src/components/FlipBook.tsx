"use client";
import { useEffect, useRef, useState } from "react";
import type React from "react";
import { withBase } from "@/lib/base";
import s from "./FlipBook.module.css";

// A printed notebook lying flat, seen from above. Click the right page to turn forward, the left page to turn back.
// No zoom, no drag, no wheel handling: scrolling passes straight through to the column.
// Pages live in /play/books/<slug>/001.webp … NNN.webp (page 1 is the cover, the last page the back cover).
// Each leaf is one sheet of paper: its front is an odd page (right side), its back the next even page (left side).

const TURN_MS = 900;
const WINDOW = 3; // leaves kept mounted on each side of the open spread

const pad = (n: number) => String(n).padStart(3, "0");

export default function FlipBook({ slug, pages, title }: { slug: string; pages: number; title: string }) {
  const leaves = Math.ceil(pages / 2);
  const [spread, setSpread] = useState(0); // 0 = closed on the cover, leaves = closed on the back
  const at = useRef(0); // the spread, readable from timers
  // Leaves turned recently stay on top and mounted until their turn finishes (value: when it ends)
  const [turning, setTurning] = useState<Map<number, number>>(new Map());
  const stageRef = useRef<HTMLDivElement>(null);
  // Autoplay: while nobody is reading, the book turns a few pages on its own, then closes again.
  // Hovering (or a first tap) closes it back to the cover; after a reader's first click it stays theirs.
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const swallowClick = useRef(false);

  useEffect(() => {
    if (!turning.size) return;
    const end = Math.max(...turning.values());
    const id = setTimeout(() => {
      const now = performance.now();
      setTurning((m) => new Map([...m].filter(([, e]) => e > now)));
    }, Math.max(0, end - performance.now()) + 30);
    return () => clearTimeout(id);
  }, [turning]);

  const turn = (dir: 1 | -1) => {
    const next = at.current + dir;
    if (next < 0 || next > leaves) return;
    const leaf = dir === 1 ? at.current : at.current - 1;
    // re-insert so the newest turn is always the topmost leaf
    setTurning((m) => { const n = new Map(m); n.delete(leaf); n.set(leaf, performance.now() + TURN_MS); return n; });
    at.current = next;
    setSpread(next);
  };

  // Close back to the cover one leaf at a time, a beat apart, so the stack stays in order
  const rewind = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toCover = () => {
    if (rewind.current) clearTimeout(rewind.current);
    const step = () => { if (at.current > 0) { turn(-1); rewind.current = setTimeout(step, 110); } };
    step();
  };

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || hover || engaged || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
        await wait(110 * 3 + TURN_MS + 1800);
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
    if (rewind.current) clearTimeout(rewind.current);
    setEngaged(true);
    turn(dir);
  };

  const src = (page: number) => withBase(`/play/books/${slug}/${pad(page)}.webp`);
  const order = [...turning.keys()];

  const mounted: number[] = [];
  for (let j = 0; j < leaves; j++) {
    if ((j >= spread - WINDOW && j < spread + WINDOW) || turning.has(j)) mounted.push(j);
  }

  const closedFront = spread === 0;
  const closedBack = spread === leaves;
  const left = spread * 2; // page number showing on the left, if any
  const status = closedFront ? `Cover of ${title}` : closedBack ? `Back cover of ${title}` : `Pages ${left} and ${left + 1} of ${pages}`;

  return (
    <div ref={stageRef} className={s.stage} onPointerEnter={onEnter} onPointerLeave={onLeave} onPointerDown={onDown}>
      <div className={s.book} data-at={closedFront ? "front" : closedBack ? "back" : undefined}>
        <div className={s.base} aria-hidden />
        {mounted.map((j) => {
          const flipped = j < spread;
          const t = order.indexOf(j);
          const z = t >= 0 ? 2000 + t : flipped ? j : leaves * 2 - j;
          const front = 2 * j + 1;
          const back = 2 * j + 2;
          return (
            <div key={j} className={s.leaf} data-flipped={flipped || undefined} data-turning={t >= 0 || undefined} style={{ zIndex: z }} aria-hidden>
              <div className={`${s.face} ${s.front}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src(front)} alt="" loading="lazy" decoding="async" draggable={false} />
              </div>
              <div className={`${s.face} ${s.back}`}>
                {back <= pages && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src(back)} alt="" loading="lazy" decoding="async" draggable={false} />
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
