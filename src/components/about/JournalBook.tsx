"use client";

import { useState } from "react";
import styles from "./JournalBook.module.css";

const COVER = "/about/journal/cover.jpg";

/**
 * Eight spreads sampled across the 2025 notebook. The book cycles them
 * rather than carrying all fifty pages — enough to leaf through.
 */
const SPREADS = Array.from(
  { length: 8 },
  (_, i) => `/about/journal/spread-${i + 1}.jpg`
);

const FLIP_MS = 720;
/** The state it opens in: shut, showing the cover. */
const CLOSED = -1;

/**
 * The design journal, opened and turned a page at a time.
 *
 * It starts shut, showing only the cover, and takes up the right half of
 * the open book's footprint — the front cover swings left off the spine
 * to reveal the first spread, so the sequence reads straight through the
 * notebook.
 *
 * The turn is a single leaf hinged on the spine: its front is what you
 * are looking at (the cover, or the current right page), its back is the
 * left page of whatever comes next. Underneath, the right half is
 * already the next spread, so once the leaf passes vertical it covers
 * the left side and the new spread is fully in place.
 */
export default function JournalBook({
  canFlip,
}: {
  /** False while the piece is being dragged, so a drag never turns a page. */
  canFlip: () => boolean;
}) {
  const [index, setIndex] = useState(CLOSED);
  const [flipping, setFlipping] = useState(false);

  const open = index !== CLOSED;
  /* Past the last spread it loops back to the first rather than shutting.
     Closing would have to turn the cover rightward, and this leaf only
     turns one way — the cover would land left and then jump right. */
  const next = open ? (index + 1) % SPREADS.length : 0;

  function flip() {
    if (flipping || !canFlip()) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIndex(next);
      return;
    }
    setFlipping(true);
    window.setTimeout(() => {
      setIndex(next);
      setFlipping(false);
    }, FLIP_MS);
  }

  const half = (src: string, side: "left" | "right") => ({
    backgroundImage: `url(${src})`,
    backgroundSize: "200% 100%",
    backgroundPosition: `${side} center`,
  });
  const whole = (src: string) => ({
    backgroundImage: `url(${src})`,
    backgroundSize: "100% 100%",
  });

  return (
    <div className={styles.book}>
      {/* Before the stage in the DOM so it paints beneath it: a leaf
          turning in 3D projects past the book's flat bounds, and the
          page block must never cut across it. */}
      <span
        className={`${styles.spine} ${open ? styles.spineOpen : ""}`}
        aria-hidden="true"
      />

      <div className={styles.stage}>
        {/* The paper itself. Shut, it is only the right half wide. */}
        {/* The interactive surface is the paper, not the footprint: shut,
            that is just the cover; open, it is both pages. */}
        <div
          className={`${styles.sheet} ${open ? styles.sheetOpen : ""}`}
          onClick={flip}
          data-cursor
          data-cursor-label={
            open ? "Click me to flip the page" : "Click me to open the book"
          }
          role="button"
          tabIndex={0}
          aria-label={
            open
              ? `Design journal, spread ${index + 1} of ${SPREADS.length}. Activate to turn the page.`
              : "Design journal, closed. Activate to open it."
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              flip();
            }
          }}
        >
          {open ? (
            <>
              <div
                className={styles.page}
                style={half(SPREADS[index], "left")}
              />
              <div
                className={styles.page}
                style={half(SPREADS[flipping ? next : index], "right")}
              />
              <span className={styles.gutter} aria-hidden="true" />
            </>
          ) : (
            <div className={styles.page} style={whole(COVER)} />
          )}
        </div>

        {flipping && (
          <div className={styles.leaf}>
            <div
              className={`${styles.face} ${styles.front}`}
              style={open ? half(SPREADS[index], "right") : whole(COVER)}
            />
            <div
              className={`${styles.face} ${styles.back}`}
              style={half(SPREADS[next], "left")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
