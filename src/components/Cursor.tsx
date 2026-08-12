"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Cursor.module.css";

/**
 * Custom cursor: a small dot that grows over interactive elements and
 * can show a label via [data-cursor-label]. Fine pointers only; disabled
 * for touch and reduced motion. The native cursor remains the base layer
 * until this mounts.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const lastLabel = useRef("");
  const [enabled, setEnabled] = useState(false);
  const [grown, setGrown] = useState(false);
  const [label, setLabel] = useState("");
  /** Set imperatively by canvas scenes, which have no DOM to hover. */
  const [forced, setForced] = useState<string | null>(null);

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
      setGrown(!!target);
      setLabel(target?.dataset.cursorLabel ?? "");
    };

    const onForce = (e: Event) => {
      const detail = (e as CustomEvent<{ label: string | null }>).detail;
      setForced(detail?.label || null);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("cursor:label", onForce);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("cursor:label", onForce);
      delete document.body.dataset.customCursor;
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // A canvas label wins over whatever the DOM last reported.
  const active = forced ?? label;
  // Keep the outgoing text mounted so the pill can animate shut around
  // it; unmounting it would collapse the width in a single frame.
  if (active) lastLabel.current = active;

  if (!enabled) return null;

  return (
    <div ref={dotRef} className={styles.cursor} aria-hidden="true">
      <div
        className={`${styles.dot} ${grown || forced ? styles.grown : ""} ${
          active ? styles.labeled : ""
        }`}
      >
        <span className={styles.label}>{active || lastLabel.current}</span>
      </div>
    </div>
  );
}
