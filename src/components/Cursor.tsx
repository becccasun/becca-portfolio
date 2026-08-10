"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./Cursor.module.css";

/**
 * Custom cursor: a small dot that grows over interactive elements and
 * can show a label via [data-cursor-label]. Fine pointers only; disabled
 * for touch and reduced motion. The native cursor remains the base layer
 * until this mounts.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [grown, setGrown] = useState(false);
  const [label, setLabel] = useState("");
  /**
   * The rendered text outlives the label that asked for it. It stays put
   * while the pill closes — otherwise React would unmount it on the first
   * frame and the collapse would have nothing to animate around — and is
   * only replaced once a new label arrives.
   */
  const [shown, setShown] = useState("");
  /** Measured pill width: the text plus 12px of padding either side. */
  const [pillW, setPillW] = useState(0);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!fine || reduced) return;

    setEnabled(true);
    document.body.dataset.customCursor = "true";

    let raf = 0;
    let x = -100;
    let y = -100;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (dotRef.current) {
            dotRef.current.style.transform = `translate(${x}px, ${y}px)`;
          }
        });
      }
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        "a, button, [data-cursor]"
      ) as HTMLElement | null;
      const next = target?.dataset.cursorLabel ?? "";
      setGrown(!!target);
      setLabel(next);
      if (next) setShown(next);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      delete document.body.dataset.customCursor;
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* Measure once the text is on screen and hand the width to CSS. The
     span keeps its natural width whatever the pill is doing, so this
     reads the same value whether the cursor is open or closed. Re-run on
     every hover, not just on new text: the first measurement can land
     before the web font swaps in, and rounding down would clip the last
     character. */
  useEffect(() => {
    if (!shown || !labelRef.current) return;
    const text = labelRef.current.getBoundingClientRect().width;
    setPillW(Math.ceil(text) + 24);
  }, [shown, label]);

  if (!enabled) return null;

  return (
    <div ref={dotRef} className={styles.cursor} aria-hidden="true">
      <div
        className={`${styles.dot} ${grown ? styles.grown : ""} ${
          label ? styles.labeled : ""
        }`}
        style={
          pillW ? ({ "--pill-w": `${pillW}px` } as CSSProperties) : undefined
        }
      >
        <span ref={labelRef} className={styles.label}>
          {shown}
        </span>
      </div>
    </div>
  );
}
