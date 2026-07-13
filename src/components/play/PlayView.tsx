"use client";

import { useEffect, useState } from "react";
import PlayGrid from "./PlayGrid";
import PlayGallery from "./PlayGallery";
import { PLAY_CATEGORIES, GRID_ORDER } from "@/lib/play";
import styles from "./PlayView.module.css";

/**
 * Play has two views: a grid of linked pieces (rachelchen.tech/fun) and
 * a first-person 3D gallery room. The switcher floats fixed on screen so
 * it stays reachable even when the gallery owns the scroll. Gallery mode
 * takes the full viewport and hides the site footer (via a body
 * attribute globals.css watches) so the room is the whole page.
 */
export default function PlayView() {
  const [view, setView] = useState<"grid" | "gallery">("grid");

  useEffect(() => {
    if (view === "gallery") {
      document.body.dataset.playView = "gallery";
      window.scrollTo(0, 0);
    } else {
      delete document.body.dataset.playView;
    }
    return () => {
      delete document.body.dataset.playView;
    };
  }, [view]);

  return (
    <div className={styles.page}>
      {view === "grid" ? (
        <>
          <header className={`container ${styles.head}`}>
            <h1 className={`serif ${styles.title}`}>
              Playing and experimenting with new ideas.
            </h1>
            <nav className={styles.shortcuts} aria-label="Play categories">
              {GRID_ORDER.map((id) => {
                const cat = PLAY_CATEGORIES.find((c) => c.id === id)!;
                return (
                  <a
                    key={id}
                    href={`#play-${id}`}
                    className={styles.shortcut}
                  >
                    {cat.label}
                  </a>
                );
              })}
            </nav>
          </header>
          <PlayGrid />
        </>
      ) : (
        <PlayGallery />
      )}

      <div className={styles.switcher} role="tablist" aria-label="Play view">
        <button
          role="tab"
          aria-selected={view === "grid"}
          className={`${styles.switchBtn} ${
            view === "grid" ? styles.switchActive : ""
          }`}
          onClick={() => setView("grid")}
        >
          Grid
        </button>
        <button
          role="tab"
          aria-selected={view === "gallery"}
          className={`${styles.switchBtn} ${
            view === "gallery" ? styles.switchActive : ""
          }`}
          onClick={() => setView("gallery")}
        >
          Gallery
        </button>
      </div>
    </div>
  );
}
