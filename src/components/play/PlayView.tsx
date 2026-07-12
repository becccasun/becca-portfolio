"use client";

import { useState } from "react";
import PlayGrid from "./PlayGrid";
import PlayCanvas from "./PlayCanvas";
import styles from "./PlayView.module.css";

/**
 * Play has two views: a grid of linked pieces (rachelchen.tech/fun) and
 * an infinite canvas with an "I'm feeling lucky" picker (emmiwu.com/playground
 * meets the Google homepage).
 */
export default function PlayView() {
  const [view, setView] = useState<"grid" | "canvas">("grid");

  return (
    <div className={styles.page}>
      <header className={`container ${styles.head}`}>
        <div>
          <p className="eyebrow">Play</p>
          <h1 className={`serif ${styles.title}`}>Made for fun</h1>
        </div>
        <div className={styles.toggle} role="tablist" aria-label="Play view">
          <button
            role="tab"
            aria-selected={view === "grid"}
            className={`${styles.toggleBtn} ${
              view === "grid" ? styles.toggleActive : ""
            }`}
            onClick={() => setView("grid")}
          >
            Grid
          </button>
          <button
            role="tab"
            aria-selected={view === "canvas"}
            className={`${styles.toggleBtn} ${
              view === "canvas" ? styles.toggleActive : ""
            }`}
            onClick={() => setView("canvas")}
          >
            Canvas
          </button>
        </div>
      </header>

      {view === "grid" ? <PlayGrid /> : <PlayCanvas />}
    </div>
  );
}
