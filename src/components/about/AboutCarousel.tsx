"use client";

import { useEffect, useRef, useState } from "react";
import { CLUBS, EDUCATION, ROLES, SPEAKING, TOOLKIT } from "@/lib/about";
import JournalBook from "./JournalBook";
import styles from "./AboutCarousel.module.css";

const PANELS = [
  "Hello",
  "Artist statement",
  "Education and experience",
  "Involvement",
  "Toolkit",
] as const;

/**
 * How long each slide holds before autoplay moves on. Per slide rather
 * than one interval: the summary carries several hundred words and the
 * involvement slide carries four cards, so a single number would rush
 * the first and strand the last.
 */
const HOLD_MS = [20000, 13000, 10000, 9000, 11000];

/**
 * Scrapbook pieces on the intro panel. Positions are percentages of the
 * canvas so the arrangement holds its shape at any viewport size; drag
 * offsets are layered on top in pixels.
 */
type Piece = {
  id: string;
  kind: "polaroid" | "note" | "card" | "tape" | "book" | "strip" | "sheet";
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
  // The pair that swaps depth on hover. They overlap on purpose: which
  // one is on top is the reader's to decide, by pointing at it.
  {
    id: "photo-1",
    kind: "polaroid",
    x: 5,
    y: 12,
    rotate: -4,
    width: 16,
    src: "/about/photo-1.jpg",
    caption: "post box, winter",
  },
  {
    id: "photo-2",
    kind: "polaroid",
    x: 16,
    y: 27,
    rotate: 3.5,
    width: 16,
    src: "/about/photo-2.jpg",
    caption: "ann arbor",
  },
  {
    id: "tenet",
    kind: "strip",
    x: 3,
    y: 83,
    rotate: -1.5,
    width: 24,
    body: "There's a limit beyond the sky.",
  },
  {
    id: "intro",
    kind: "sheet",
    x: 44,
    y: 12,
    rotate: 0.6,
    width: 50,
  },
];

/** The self-introduction, one paragraph per block of the sheet. */
const INTRO: string[] = [
  "I'm a product design student at the University of Michigan with minors in artificial intelligence and architecture. Understanding how to design for human pain points and prioritizing depth is at the heart of what I do. My strongest suit is in designing complex interactions and experiences, prototyping and building with AI, and obsessing over the final little details in Figma. My most recent role was serving as the sole design hire at a Series A fintech startup called Loop Financial. Previously, I've consulted for multiple Y Combinator companies, too. On campus, I am the director of design at MHacks, consulting for up-and-coming YC startups through Atlas Digital, and building a product of my own in Shift Creator Space.",
  "In a past life, I was an aspiring architect. Moving between design methodologies has shaped how I think and make, and it taught me to treat reflection as part of the process. My ideas form through rapid iteration, each built on the last and always centered on the people I'm designing for.",
  "When I'm not online, you'll find me working on an oil painting, going to local design workshops, or watching my favorite movies in the theaters.",
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
  /** Autoplay. Off by default: a deck that starts moving on its own is
   *  a deck that moves while you are still reading the first slide. */
  const [playing, setPlaying] = useState(false);
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

  /* Autoplay advances one slide per hold, then stops at the end rather
     than looping — the deck has a last word and should let it land.
     Never runs for someone who asked for less motion. */
  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => {
      const next = active + 1;
      if (next >= PANELS.length) {
        setPlaying(false);
        return;
      }
      goTo(next);
    }, HOLD_MS[active] ?? 10000);
    return () => window.clearTimeout(id);
  }, [playing, active]);

  /* Any deliberate input hands control back. Autoplay that fights the
     reader for the scroll position is worse than no autoplay. */
  useEffect(() => {
    if (!playing) return;
    const stop = () => setPlaying(false);
    const el = scrollerRef.current;
    el?.addEventListener("wheel", stop, { passive: true });
    el?.addEventListener("pointerdown", stop);
    window.addEventListener("keydown", stop);
    return () => {
      el?.removeEventListener("wheel", stop);
      el?.removeEventListener("pointerdown", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [playing]);

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
                  {p.kind === "strip" && (
                    <span className={styles.stripText}>{p.body}</span>
                  )}
                  {p.kind === "sheet" && (
                    <>
                      {INTRO.map((para, i) => (
                        <p key={i} className={styles.sheetText}>
                          {para}
                        </p>
                      ))}
                    </>
                  )}
                  {p.kind === "note" && <p>{p.body}</p>}
                  {p.kind === "tape" && <span>{p.body}</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* 2 — artist statement: the journal, and the talking */}
        <section className={styles.panel} aria-label="Artist statement">
          <div className={styles.statement}>
            {/* Top left, and big enough to actually read: the journal is
                the evidence that the making happens off the screen too. */}
            <div className={styles.journalSlot}>
              <JournalBook canFlip={() => true} />
            </div>

            <p className={`serif ${styles.statementText}`}>
              I am happiest when I get to talk about my own work, so I only
              ever aim to make work I would be proud to talk about.
            </p>

            {/* Bottom right, overlapping: hovering one lifts it and says
                what it is. Placeholder frames until the photographs land. */}
            <ul className={styles.shots}>
              {SPEAKING.map((shot, i) => (
                <li
                  key={shot.id}
                  className={styles.shot}
                  style={
                    {
                      "--i": String(i),
                      "--tilt": `${(i - 1) * 4}deg`,
                    } as React.CSSProperties
                  }
                >
                  {shot.src ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={shot.src} alt="" draggable={false} />
                  ) : (
                    <span className={styles.shotEmpty} aria-hidden="true" />
                  )}
                  <span className={styles.shotContext}>{shot.context}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 2 — professional experience */}
        <section
          className={styles.panel}
          aria-label="Education and experience"
        >
          <div className={`${styles.inner} ${styles.twoUp}`}>
            <div>
              <p className="eyebrow">Education</p>
              <ol className={styles.roles}>
                {EDUCATION.map((e) => (
                  <li key={e.id} className={styles.roleRow}>
                    <span className={styles.rolePeriod}>{e.period}</span>
                    <span className={styles.roleText}>
                      <span className={styles.roleOrg}>{e.school}</span>
                      <span className={styles.roleTitle}>{e.credential}</span>
                      {e.detail && (
                        <span className={styles.roleDetail}>{e.detail}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div>
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
          </div>
        </section>

        {/* 4 — campus involvement */}
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

        {/* 5 — the toolkit, mapped rather than listed */}
        <section className={styles.panel} aria-label="Toolkit">
          <div className={`${styles.inner} ${styles.mapPanel}`}>
            <p className="eyebrow">Toolkit</p>
            {/* Two axes, four quadrants: what the work is for, crossed
                with whose hands are on it. A list would have said which
                tools; this says what each one is for. */}
            <div className={styles.map}>
              <span className={`${styles.axis} ${styles.axisX}`} aria-hidden="true" />
              <span className={`${styles.axis} ${styles.axisY}`} aria-hidden="true" />

              <span className={`${styles.axisLabel} ${styles.axisTop}`}>Agentic</span>
              <span className={`${styles.axisLabel} ${styles.axisBottom}`}>Human</span>
              <span className={`${styles.axisLabel} ${styles.axisLeft}`}>Explorative</span>
              <span className={`${styles.axisLabel} ${styles.axisRight}`}>Goal-oriented</span>

              <ul className={styles.tools}>
                {TOOLKIT.map((t) => (
                  <li
                    key={t.id}
                    className={styles.tool}
                    style={{
                      // -1..1 in both axes, with y inverted because the
                      // agentic end is up and CSS counts downward.
                      // Mapped into 8–92% rather than the full width:
                      // the axis labels own the outer margin, and a
                      // sticker centred on 0% would hang off the plot.
                      left: `${8 + ((t.x + 1) / 2) * 84}%`,
                      top: `${8 + ((1 - t.y) / 2) * 84}%`,
                    }}
                  >
                    {t.art ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={t.art} alt="" className={styles.toolArt} />
                    ) : (
                      <span className={styles.toolChip} aria-hidden="true">
                        {t.name.slice(0, 2)}
                      </span>
                    )}
                    <span className={styles.toolName}>{t.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

      </div>

      {/* Panel rail: position, a way back to any panel, and the switch
          that hands the deck over to autoplay. */}
      <nav className={styles.rail} aria-label="About sections">
        <button
          type="button"
          className={styles.play}
          onClick={() => {
            // Restarting from the end should start over, not sit on the
            // last slide waiting for a tick that never comes.
            if (!playing && active >= PANELS.length - 1) goTo(0);
            setPlaying((p) => !p);
          }}
          aria-pressed={playing}
          aria-label={playing ? "Pause the slideshow" : "Play the slideshow"}
        >
          {playing ? (
            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
              <rect x="2" y="1.5" width="3" height="9" rx="1" fill="currentColor" />
              <rect x="7" y="1.5" width="3" height="9" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
              <path d="M3 1.5 L10.5 6 L3 10.5 Z" fill="currentColor" />
            </svg>
          )}
        </button>
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
