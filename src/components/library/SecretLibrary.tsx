"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MAGNETS } from "@/lib/library";
import styles from "./SecretLibrary.module.css";

/** Pixels of drag that count as a full pull. */
const PULL_DISTANCE = 96;
/** Fraction of that pull which commits, rather than springing back. */
const PULL_COMMIT = 0.55;
/** Upward wheel travel at the top of the page that also opens it. */
const WHEEL_TO_OPEN = 220;
/** Wheel gestures reset if nothing arrives for this long. */
const WHEEL_IDLE_MS = 400;
/** Movement under this counts as a tap rather than a drag. */
const TAP_SLOP = 6;

/**
 * A string hanging from the top of the hero. Pull it down, or scroll up
 * when you are already at the top of the page, and a panel of small
 * builds drops over the page.
 *
 * It is an overlay rather than a section above the hero: the page stays
 * at "/" and never has to load pre-scrolled, which is what a real
 * region above the fold would require and what browsers restore
 * inconsistently.
 */
export default function SecretLibrary() {
  const [open, setOpen] = useState(false);
  // 0 at rest, 1 at a full pull. Drives the string only.
  const [pull, setPull] = useState(0);
  const dragFrom = useRef<number | null>(null);
  /** Furthest the pointer travelled during this grab, in pixels. */
  const dragTravel = useRef(0);
  /** Set when a pointer gesture already decided; stops the click that
   *  follows it from deciding a second time. */
  const handled = useRef(false);
  const wheel = useRef({ travel: 0, at: 0 });
  // The panel is portalled to <body>, which only exists on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    setOpen(false);
    setPull(0);
  }, []);

  // Escape closes, matching the focused postcard and the chat panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // The page behind must not scroll while the panel is over it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Scrolling up when there is nothing left to scroll up into is the
  // other way in. Passive: this never cancels the scroll, it only
  // notices it, so the page stays responsive either way.
  useEffect(() => {
    if (open) return;
    const onWheel = (e: WheelEvent) => {
      if (window.scrollY > 4 || e.deltaY >= 0) {
        wheel.current.travel = 0;
        return;
      }
      const now = performance.now();
      if (now - wheel.current.at > WHEEL_IDLE_MS) wheel.current.travel = 0;
      wheel.current.at = now;
      wheel.current.travel += -e.deltaY;
      if (wheel.current.travel > WHEEL_TO_OPEN) {
        wheel.current.travel = 0;
        setOpen(true);
      }
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [open]);

  function onPointerDown(e: React.PointerEvent) {
    dragFrom.current = e.clientY;
    dragTravel.current = 0;
    handled.current = false;
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (dragFrom.current === null) return;
    const dy = e.clientY - dragFrom.current;
    dragTravel.current = Math.max(dragTravel.current, Math.abs(dy));
    setPull(Math.max(0, Math.min(1, dy / PULL_DISTANCE)));
  }

  function onPointerUp() {
    if (dragFrom.current === null) return;
    dragFrom.current = null;
    const tapped = dragTravel.current < TAP_SLOP;
    // Decided here rather than left to the click that follows: pointer
    // capture makes that click unreliable, and on touch there may not
    // be one at all. A tap opens it. So does a pull past the commit
    // point. A pull released short of that springs back, so a stray tug
    // never takes anyone somewhere they did not ask to go.
    setPull((p) => {
      if (tapped || p >= PULL_COMMIT) {
        handled.current = true;
        setOpen(true);
      }
      return 0;
    });
  }

  // Keyboard only. A pointer gesture has already answered by the time
  // its click arrives, and would otherwise answer twice.
  function onClick() {
    if (handled.current) {
      handled.current = false;
      return;
    }
    setOpen(true);
  }

  return (
    <>
      {/* The string. A tap opens it too — dragging is the flourish, not
          the requirement, and there is nothing to drag on a phone. */}
      <button
        type="button"
        className={styles.cord}
        style={{ ["--pull" as string]: String(pull) }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
        aria-label="Open the secret library"
        aria-expanded={open}
        data-cursor-label="Pull"
      >
        <span className={styles.cordLine} />
        <span className={styles.cordBead} />
      </button>

      {/* Portalled to <body>. `main` is its own stacking context at
          z-index 1, so a panel rendered inside it can never paint over
          the nav however high its z-index — it was leaving the bar
          floating on top of the board. Out here it covers the page. */}
      {mounted &&
        createPortal(
          <div
            className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
            aria-hidden={!open}
            // Clicking the board itself puts it away; the magnets stop
            // the click from reaching here.
            onClick={close}
          >
        <div className={styles.board}>
          {MAGNETS.map((m) => {
            const inner = (
              <>
                {m.art ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={m.art} alt="" className={styles.art} />
                ) : (
                  <span className={styles.face} aria-hidden="true" />
                )}
                <span className={styles.label}>{m.title}</span>
                {m.blurb && <span className={styles.blurb}>{m.blurb}</span>}
              </>
            );
            const common = {
              className: `${styles.magnet} ${styles[m.shape]} ${
                m.placeholder ? styles.empty : ""
              }`,
              style: {
                left: `${m.x}%`,
                top: `${m.y}%`,
                width: `${m.size}%`,
                ["--tilt" as string]: `${m.rotate}deg`,
              } as React.CSSProperties,
              onClick: (e: React.MouseEvent) => e.stopPropagation(),
            };
            return m.href ? (
              <a
                key={m.id}
                {...common}
                href={m.href}
                target="_blank"
                rel="noreferrer"
                data-cursor-label="Open"
              >
                {inner}
              </a>
            ) : (
              <div key={m.id} {...common} aria-hidden={m.placeholder}>
                {inner}
              </div>
            );
          })}
        </div>

        <div className={styles.foot}>
          <p className={`serif ${styles.title}`}>Fun apps and tools</p>
          <button
            type="button"
            className={styles.close}
            onClick={close}
            aria-label="Close the secret library"
          >
            <svg viewBox="0 0 24 14" width="24" height="14" aria-hidden="true">
              <path
                d="M2 2 L12 11 L22 2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
