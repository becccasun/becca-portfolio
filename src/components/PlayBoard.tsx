"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type React from "react";
import { playColumns, playItems, type PlayColumnId, type PlayItem } from "@/play";
import { withBase } from "@/lib/base";
import Notes from "./Notes";
import FlipBook from "./FlipBook";
import ArtCanvas from "./ArtCanvas";
import HoverClip from "./HoverClip";
import s from "./PlayBoard.module.css";

// Starting widths: Digital Explorations is the widest (and, as the last column, also takes any spare room)
const DEFAULT_W: Record<PlayColumnId, number> = { notes: 300, art: 340, digital: 560 };
const MIN_W = 240;
const MAX_W = 900;
const ids = playColumns.map((c) => c.id);
const isId = (v: string | null): v is PlayColumnId => !!v && (ids as string[]).includes(v);

// ?col=art opens that column full width (desktop) or selects its tab (phone).
function readCol(): PlayColumnId | null {
  const v = new URLSearchParams(window.location.search).get("col");
  return isId(v) ? v : null;
}

// Wrap a state change in a view transition where the browser has one.
function transition(fn: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    doc.startViewTransition(() => flushSync(fn));
  } else fn();
}

function Clock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return <p className={s.clock}>{now || " "}</p>;
}

function Card({ it, style }: { it: PlayItem; style?: React.CSSProperties }) {
  const media =
    it.type === "video" ? (
      <video src={withBase(it.src)} autoPlay muted loop playsInline />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={withBase(it.src)} alt={it.title} loading="lazy" />
    );
  const inner = (
    <>
      <p className={s.date}>{it.date}</p>
      {!it.canvas && <p className={s.cardTitle}>{it.title}</p>}
      {it.note && <p className={s.note}>{it.note}</p>}
      {it.canvas ? (
        <ArtCanvas src={it.src} w={it.w} h={it.h} long={it.canvas.long} depth={it.canvas.depth} label={`${it.title}, ${it.note ?? "painting"}, ${it.date}`} />
      ) : it.book ? (
        <FlipBook slug={it.book.slug} pages={it.book.pages} title={it.title} />
      ) : it.preview ? (
        <HoverClip src={it.src} clip={it.preview} alt={it.title} className={s.media} style={{ aspectRatio: `${it.w} / ${it.h}` }} />
      ) : (
        <div className={s.media} style={{ aspectRatio: `${it.w} / ${it.h}` }}>{media}</div>
      )}
    </>
  );
  return it.href ? (
    <a className={`${s.card} ${s.linked}`} style={style} href={withBase(it.href)} target="_blank" rel="noreferrer">{inner}</a>
  ) : (
    <div className={it.canvas ? `${s.card} ${s.bare}` : s.card} style={style}>{inner}</div>
  );
}

// ── Bento: the expanded Digital Explorations view ───────────────────────────
// Cards are laid out in rows. Every card in a row gets the same media height, chosen so the row exactly
// fills the width, and the cards stretch to one height, so every gap (across and down) is the same value.
// Where each row breaks is picked to keep all rows as close to TARGET_H as possible.
const BENTO_GAP = 16; // matches --space-16 in the CSS
const CARD_X = 26; // a card's horizontal padding and border around its media
const TARGET_H = 300;
const mediaAspect = (it: PlayItem) => (it.book ? 4 / 3 : it.w / it.h); // a flip book's stage is 4:3

function bentoRows(items: PlayItem[], width: number) {
  const a = items.map(mediaAspect);
  const n = a.length;
  const height = (i: number, j: number) => {
    let sum = 0;
    for (let k = i; k < j; k++) sum += a[k];
    const count = j - i;
    return (width - BENTO_GAP * (count - 1) - CARD_X * count) / sum;
  };
  const target = Math.min(TARGET_H, width * 0.4);
  const cost = (h: number) => (h <= 0 ? Infinity : ((h - target) / target) ** 2 * (h > target ? 1.5 : 1));
  // best[j]: cheapest way to lay out the first j items; from[j]: where its last row starts
  const best = [0, ...Array(n).fill(Infinity)];
  const from = Array(n + 1).fill(0);
  for (let j = 1; j <= n; j++) {
    for (let i = j - 1; i >= 0; i--) {
      const c = best[i] + cost(height(i, j));
      if (c < best[j]) { best[j] = c; from[j] = i; }
    }
  }
  const rows: { items: PlayItem[]; h: number }[] = [];
  for (let j = n; j > 0; j = from[j]) rows.unshift({ items: items.slice(from[j], j), h: height(from[j], j) });
  return rows;
}

function Bento({ items }: { items: PlayItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const rows = width ? bentoRows(items, width) : [];
  return (
    <div ref={ref} className={s.bento}>
      {rows.map((row, r) => (
        <div key={r} className={s.bentoRow}>
          {/* from a zero basis each card already holds its padding, so the spare width is shared in proportion
              to the media widths: every card's media lands at exactly row.h tall and the row meets both edges */}
          {row.items.map((it) => <Card key={it.src} it={it} style={{ flex: `${row.h * mediaAspect(it)} 1 0px` }} />)}
        </div>
      ))}
    </div>
  );
}

function Statement({ active, onPick }: { active: PlayColumnId | null; onPick: (id: PlayColumnId) => void }) {
  return (
    <>
      <p className={s.name}>Rebecca Sun</p>
      <div className={s.statement}>
        <p>
          Being hands-on with creative endeavors is very important to me. Here is a curated selection of what I&apos;ve
          worked on so far.
        </p>
        <p>
          Currently, I&apos;m working on Rebecca&apos;s Internet Archive, a project documenting everything on the
          internet that I&apos;ve taken inspiration from, created, written, and appreciated.
        </p>
      </div>
      <nav className={s.menu} aria-label="Play columns">
        {playColumns.map((c) => (
          <button key={c.id} type="button" className={s.menuItem} aria-current={active === c.id || undefined} onClick={() => onPick(c.id)}>
            {c.title}
          </button>
        ))}
      </nav>
    </>
  );
}

function Divider({ width, reset, onWidth }: { width: number; reset: number; onWidth: (w: number) => void }) {
  const drag = useRef<{ x: number; w: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const clamp = (w: number) => Math.min(MAX_W, Math.max(MIN_W, Math.round(w)));
  return (
    <div
      className={s.divider}
      data-dragging={dragging || undefined}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize column"
      aria-valuemin={MIN_W}
      aria-valuemax={MAX_W}
      aria-valuenow={width}
      tabIndex={0}
      onPointerMove={(e) => {
        e.currentTarget.style.setProperty("--y", `${e.clientY - e.currentTarget.getBoundingClientRect().top}px`);
        if (drag.current) onWidth(clamp(drag.current.w + e.clientX - drag.current.x));
      }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, w: width };
        setDragging(true);
      }}
      onPointerUp={() => { drag.current = null; setDragging(false); }}
      onPointerCancel={() => { drag.current = null; setDragging(false); }}
      onDoubleClick={() => onWidth(reset)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          onWidth(clamp(width + (e.key === "ArrowRight" ? 32 : -32)));
        }
      }}
    >
      <span className={s.grip} aria-hidden>
        <svg viewBox="0 0 24 12" width="22" height="11"><path d="M6 1 1 6l5 5M18 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 0v12" stroke="currentColor" strokeWidth="1.8" /></svg>
      </span>
      <span className={s.pill} aria-hidden>Drag to resize</span>
    </div>
  );
}

export default function PlayBoard() {
  const [col, setCol] = useState<PlayColumnId | null>(null);
  const [widths, setWidths] = useState<Record<PlayColumnId, number>>(DEFAULT_W);

  useEffect(() => {
    setCol(readCol());
    const onPop = () => transition(() => setCol(readCol()));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = useCallback((next: PlayColumnId | null, replace = false) => {
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("col", next);
    else url.searchParams.delete("col");
    history[replace ? "replaceState" : "pushState"](null, "", url);
    transition(() => setCol(next));
  }, []);

  // Phones open on the main column, Digital Explorations
  const tab = col ?? "digital";

  return (
    <>
      {/* Desktop: the resizable column board */}
      <div className={s.board} data-expanded={col ?? undefined}>
        <aside className={s.intro}>
          <Statement active={col} onPick={(id) => go(id)} />
          <Clock />
        </aside>
        {playColumns.map((c) => {
          const open = col === c.id;
          if (col && !open) return null;
          return (
            <div key={c.id} className={s.colWrap}>
              <section
                className={s.col}
                style={open ? undefined : { width: widths[c.id] }}
                aria-labelledby={`col-${c.id}`}
              >
                <header className={s.colHead}>
                  {open && (
                    <button type="button" className={s.back} onClick={() => go(null)}>← Back</button>
                  )}
                  <h2 id={`col-${c.id}`} className={s.colTitle}>
                    {open ? (
                      c.title
                    ) : (
                      <button type="button" onClick={() => go(c.id)}>
                        {c.title} <span className={s.chev} aria-hidden>›</span>
                      </button>
                    )}
                  </h2>
                  <p className={s.colDesc}>{c.description}</p>
                </header>
                <div className={s.colBody} tabIndex={0} aria-label={c.id === "notes" ? "Notes" : `${c.title} projects`}>
                  {open && c.id === "digital" ? (
                    <Bento items={playItems.filter((it) => it.column === c.id)} />
                  ) : (
                    <div className={s.flow}>
                      {c.id === "notes" ? <Notes /> : playItems.filter((it) => it.column === c.id).map((it) => <Card key={it.src} it={it} />)}
                    </div>
                  )}
                </div>
              </section>
              {!open && <Divider width={widths[c.id]} reset={DEFAULT_W[c.id]} onWidth={(w) => setWidths((p) => ({ ...p, [c.id]: w }))} />}
            </div>
          );
        })}
      </div>

      {/* Phones: one page-scrolling list behind real tabs, no nested scrollers or drag targets */}
      <div className={s.mobile}>
        <div className={s.mobileIntro}>
          <Statement active={null} onPick={(id) => go(id, true)} />
          <Clock />
        </div>
        <div className={s.tabs} role="tablist" aria-label="Play columns">
          {playColumns.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              id={`tab-${c.id}`}
              aria-selected={tab === c.id}
              aria-controls="play-panel"
              className={s.tab}
              onClick={() => go(c.id, true)}
            >
              {c.title}
            </button>
          ))}
        </div>
        <div id="play-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className={s.panel}>
          <p className={s.colDesc}>{playColumns.find((c) => c.id === tab)?.description}</p>
          {tab === "notes" ? <Notes /> : playItems.filter((it) => it.column === tab).map((it) => <Card key={it.src} it={it} />)}
        </div>
      </div>
    </>
  );
}
