"use client";

import { useEffect, useRef, useState } from "react";
import { drawFortune } from "@/lib/fortunes";
import styles from "./FortuneBottle.module.css";

/**
 * The footer's small reward: a corked bottle floating in the top right
 * corner. Click it and the note inside comes out.
 *
 * The bottle drawn here is a placeholder standing in for Rebecca's own
 * artwork. It is deliberately built from plain shapes rather than a
 * detailed illustration, so swapping in the real graphic later means
 * replacing one <svg> and nothing else. Everything about the
 * interaction lives outside it.
 */
export default function FortuneBottle() {
  const [fortune, setFortune] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape closes the note, matching every other dismissable thing on
  // the site. Only bound while a note is actually open.
  useEffect(() => {
    if (!fortune) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFortune(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fortune]);

  return (
    <div className={styles.slot}>
      <button
        type="button"
        className={styles.bottle}
        onClick={() => setFortune((prev) => drawFortune(prev ?? undefined))}
        aria-label={fortune ? "Draw another fortune" : "Open the fortune bottle"}
        data-cursor-label="Open"
      >
        <svg
          viewBox="0 0 44 84"
          width="44"
          height="84"
          aria-hidden="true"
          className={styles.glass}
        >
          {/* cork */}
          <rect
            x="17"
            y="3"
            width="10"
            height="9"
            rx="2.5"
            className={styles.cork}
          />
          {/* neck and body, one outline so the glass reads as one vessel */}
          <path
            d="M18 12 L18 24 Q18 27 15 30 Q8 37 8 49 L8 72 Q8 79 15 79 L29 79 Q36 79 36 72 L36 49 Q36 37 29 30 Q26 27 26 24 L26 12 Z"
            className={styles.body}
          />
          {/* the note, rolled, resting at an angle in the bottle */}
          <rect
            x="14"
            y="52"
            width="17"
            height="7"
            rx="3.5"
            transform="rotate(-9 22.5 55.5)"
            className={styles.note}
          />
          {/* a single highlight, so it reads as glass and not as a jar */}
          <path d="M13 40 Q11 50 12 68" className={styles.shine} />
        </svg>
      </button>

      {/* Announced politely: the fortune is a small delight, not
          something that should interrupt what a reader is doing. */}
      <div className={styles.live} role="status" aria-live="polite">
        {fortune && (
          <div className={styles.note_card}>
            <p className={`serif ${styles.text}`}>{fortune}</p>
            <button
              type="button"
              ref={closeRef}
              className={styles.close}
              onClick={() => setFortune(null)}
            >
              Put it back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
