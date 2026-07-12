"use client";

import { useState } from "react";
import PlayGrid from "./PlayGrid";
import PlayGallery from "./PlayGallery";
import styles from "./PlayView.module.css";

/**
 * Play has two views: a grid of linked pieces (rachelchen.tech/fun) and
 * a first-person 3D gallery room with an "I'm feeling lucky" picker.
 */
export default function PlayView() {
  const [view, setView] = useState<"grid" | "gallery">("grid");

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
            aria-selected={view === "gallery"}
            className={`${styles.toggleBtn} ${
              view === "gallery" ? styles.toggleActive : ""
            }`}
            onClick={() => setView("gallery")}
          >
            Gallery
          </button>
        </div>
      </header>

      {view === "grid" ? <PlayGrid /> : <PlayGallery />}
    </div>
  );
}
