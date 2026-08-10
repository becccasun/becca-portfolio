"use client";

import { useEffect, useRef, useState } from "react";
import { CLUBS, ROLES } from "@/lib/about";
import JournalBook from "./JournalBook";
import styles from "./AboutCarousel.module.css";

const PANELS = ["Hello", "Experience", "Involvement"] as const;

/**
 * Scrapbook pieces on the intro panel. Positions are percentages of the
 * canvas so the arrangement holds its shape at any viewport size; drag
 * offsets are layered on top in pixels.
 */
type Piece = {
  id: string;
  kind: "polaroid" | "note" | "card" | "tape" | "book";
  x: number;
  y: number;
  rotate: number;
  width: number;
  src?: string;
  caption?: string;
  title?: string;
  body?: string;
};

const PIECES: Piece[] = [
  {
    id: "intro",
    kind: "card",
    x: 2,
    y: 11,
    rotate: -1.2,
    width: 26,
    title: "Hi, I'm Rebecca.",
    body: "I started in the fine arts, detoured into architecture school, and landed in product design. The in-between spaces are where I do my best work.",
  },
  {
    id: "journal",
    kind: "book",
    x: 31,
    y: 13,
    rotate: -1.6,
    width: 36,
  },
  {
    id: "photo-2",
    kind: "polaroid",
    x: 71,
    y: 8,
    rotate: 3.2,
    width: 16,
    src: "/about/photo-2.jpg",
    caption: "ann arbor",
  },
  {
    id: "photo-1",
    kind: "polaroid",
    x: 4,
    y: 55,
    rotate: -3.4,
    width: 15,
    src: "/about/photo-1.jpg",
    caption: "post box, winter",
  },
  {
    id: "now",
    kind: "note",
    x: 69,
    y: 57,
    rotate: 1.8,
    width: 25,
    body: "Currently designing at Loop Financial, and studying UX and AI at the University of Michigan.",
  },
  {
    id: "drag-hint",
    kind: "tape",
    x: 33,
    y: 76,
    rotate: -2.5,
    width: 15,
    body: "drag me around",
  },
];

/**
 * About as a vertical carousel: three panels, each owning the full
 * viewport, with scroll snapping so one gesture moves one panel. The
 * intro panel is a scrapbook canvas whose pieces can be dragged around;
 * the rest are fixed compositions. Scrolling past the last panel chains
 * out to the page and reveals the footer.
 */
export default function AboutCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [canvas, setCanvas] = useState({ w: 0, h: 0 });
  /* Offsets are fractions of the canvas, not pixels: a pixel offset stops
     meaning the same thing the moment the window changes size, and pieces
     drift off the board with no way to get them back. */
  const [offsets, setOffsets] = useState<
    Record<string, { fx: number; fy: number }>
  >({});
  const drag = useRef<{
    id: string;
    startX: number;
    startY: number;
    fx: number;
    fy: number;
  } | null>(null);
  /** True while the current gesture has become a drag. */
  const moved = useRef(false);
  /** Set on pointer-up when that gesture was a drag, so the click that
   *  immediately follows can be ignored once and then forgotten. */
  const justDragged = useRef(false);

  /* The footer would sit below the last panel and reintroduce the page
     scroll the carousel is meant to replace. */
  useEffect(() => {
    document.body.dataset.aboutCarousel = "true";
    return () => {
      delete document.body.dataset.aboutCarousel;
    };
  }, []);

  /* Two scrollers overlap on this route: the panels here, and the page
     itself, whose entire scroll length is the footer drawer (main is one
     viewport tall, so scrollY > 0 means the drawer is open). Left alone,
     an upward flick does whichever of the two the pointer happens to be
     over — closing the drawer from the footer, but paging the carousel
     from anywhere above it. Claim the gesture while the drawer is open so
     it always closes first, whatever the cursor is on top of. Capture
     phase, because the scroller would otherwise consume it first. */
  useEffect(() => {
    /* Wheel deltas arrive in pixels, lines or pages depending on the
       device; normalise before handing them to scrollBy. */
    const toPixels = (e: WheelEvent) =>
      e.deltaMode === 1
        ? e.deltaY * 16
        : e.deltaMode === 2
        ? e.deltaY * window.innerHeight
        : e.deltaY;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY >= 0 || window.scrollY <= 0) return;
      e.preventDefault();
      // Closes by the same distance the gesture would have scrolled, so
      // it retracts the way it was pulled open. Clamped at 0 by scrollBy;
      // once shut, later events fall through to the carousel. "instant"
      // is required: html sets scroll-behavior: smooth, which would turn
      // every wheel tick into its own easing animation and leave the
      // drawer lagging behind the hand instead of tracking it.
      window.scrollBy({ top: toPixels(e), behavior: "instant" });
    };

    const opts = { passive: false, capture: true } as const;
    window.addEventListener("wheel", onWheel, opts);
    return () => window.removeEventListener("wheel", onWheel, opts);
  }, []);

  /* Two things have to survive a resize: the scrapbook needs its canvas
     size to place pieces, and the scroller has to stay on a whole panel
     rather than being left straddling two of them. */
  useEffect(() => {
    const board = canvasRef.current;
    const scroller = scrollerRef.current;
    if (!board || !scroller) return;

    const activeIndex = () =>
      Math.round(scroller.scrollTop / Math.max(1, scroller.clientHeight));

    let parked = activeIndex();
    const measure = () => {
      const r = board.getBoundingClientRect();
      setCanvas({ w: r.width, h: r.height });
      // Snapping is by proportion of a panel, so a changed panel height
      // leaves the old scrollTop pointing into the middle of one.
      scroller.scrollTo({ top: parked * scroller.clientHeight });
    };

    const ro = new ResizeObserver(measure);
    ro.observe(board);
    ro.observe(scroller);
    const onScroll = () => {
      parked = activeIndex();
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    measure();
    return () => {
      ro.disconnect();
      scroller.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const panels = Array.from(el.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(panels.indexOf(e.target as HTMLElement));
        });
      },
      { root: el, threshold: 0.55 }
    );
    panels.forEach((p) => io.observe(p));
    return () => io.disconnect();
  }, []);

  function startDrag(e: React.PointerEvent, id: string) {
    const current = offsets[id] ?? { fx: 0, fy: 0 };
    drag.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      fx: current.fx,
      fy: current.fy,
    };
    moved.current = false;
    // Capture is deliberately deferred to onDrag: capturing here would
    // route the click to this wrapper, and the book inside would never
    // receive it.
  }

  function onDrag(e: React.PointerEvent) {
    const d = drag.current;
    // Measured live rather than read from state: the observer that fills
    // that state may not have run yet, and a drag that silently does
    // nothing is worse than one pointer-move of slightly stale geometry.
    const box = canvasRef.current?.getBoundingClientRect();
    if (!d || !box || !box.width || !box.height) return;
    const movedX = e.clientX - d.startX;
    const movedY = e.clientY - d.startY;
    // 6px of slop: a couple of pixels of hand-shake while clicking should
    // still count as a click, not a drag.
    if (!moved.current && Math.abs(movedX) + Math.abs(movedY) > 6) {
      moved.current = true;
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        /* pointer already gone; the drag still tracks via events */
      }
    }
    if (!moved.current) return;
    setOffsets((o) => ({
      ...o,
      [d.id]: {
        fx: d.fx + movedX / box.width,
        fy: d.fy + movedY / box.height,
      },
    }));
  }

  function endDrag(e: React.PointerEvent) {
    const d = drag.current;
    if (d && moved.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
    }
    drag.current = null;
    justDragged.current = moved.current;
    moved.current = false;
  }

  function goTo(i: number) {
    const el = scrollerRef.current;
    if (!el) return;
    (el.children[i] as HTMLElement).scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.scroller} ref={scrollerRef}>
        {/* 1 — the scrapbook */}
        <section className={styles.panel} aria-label="Introduction">
          <div className={styles.canvas} ref={canvasRef}>
            {PIECES.map((p) => {
              const o = offsets[p.id] ?? { fx: 0, fy: 0 };
              const dx = o.fx * canvas.w;
              const dy = o.fy * canvas.h;
              /* fx/fy are fractions of the canvas, so both the placement
                 and any dragging survive a resize unchanged. */
              return (
                <div
                  key={p.id}
                  className={`${styles.piece} ${styles[p.kind]}`}
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.width}%`,
                    transform: `translate(${dx}px, ${dy}px) rotate(${p.rotate}deg)`,
                  }}
                  onPointerDown={(e) => startDrag(e, p.id)}
                  onPointerMove={onDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                >
                  {p.kind === "polaroid" && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.src} alt="" draggable={false} />
                      <span className={styles.caption}>{p.caption}</span>
                    </>
                  )}
                  {p.kind === "card" && (
                    <>
                      <h1 className={`display ${styles.cardTitle}`}>
                        {p.title}
                      </h1>
                      <p className={styles.cardBody}>{p.body}</p>
                    </>
                  )}
                  {p.kind === "book" && (
                    <JournalBook
                      canFlip={() => {
                        const blocked = justDragged.current;
                        justDragged.current = false;
                        return !blocked;
                      }}
                    />
                  )}
                  {p.kind === "note" && <p>{p.body}</p>}
                  {p.kind === "tape" && <span>{p.body}</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* 2 — professional experience */}
        <section className={styles.panel} aria-label="Experience">
          <div className={styles.inner}>
            <p className="eyebrow">Experience</p>
            {/* A quick read of where she's been — deliberately not links,
                and no descriptions: the case studies are what Works is for. */}
            <ol className={styles.roles}>
              {ROLES.map((r) => (
                <li key={r.org} className={styles.roleRow}>
                  <span className={styles.rolePeriod}>{r.period}</span>
                  <span className={styles.roleText}>
                    <span className={styles.roleOrg}>{r.org}</span>
                    <span className={styles.roleTitle}>{r.title}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 3 — campus involvement */}
        <section className={styles.panel} aria-label="Campus involvement">
          <div className={styles.inner}>
            <p className="eyebrow">Campus involvements</p>
            <ul className={styles.clubs}>
              {CLUBS.map((c) => (
                <li key={c.id} className={styles.club}>
                  <div className={styles.clubInner}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className={styles.clubCard}
                      src={c.card}
                      alt=""
                      draggable={false}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className={styles.clubPhoto}
                      src={c.photo}
                      alt=""
                      draggable={false}
                    />
                    {/* The artwork carries its text as pixels, so the real
                        copy lives here for screen readers and search. */}
                    <span className="sr-only">
                      {c.name} — {c.role}. {c.description}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

      </div>

      {/* Panel rail: position, and a way back to any panel. */}
      <nav className={styles.rail} aria-label="About sections">
        {PANELS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`${styles.dot} ${i === active ? styles.dotActive : ""}`}
            onClick={() => goTo(i)}
            aria-label={label}
            aria-current={i === active}
          />
        ))}
      </nav>
    </div>
  );
}
