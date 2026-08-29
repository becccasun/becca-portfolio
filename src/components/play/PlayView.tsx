"use client";

import { useEffect, useState } from "react";
import PlayGrid from "./PlayGrid";
import PlayGallery from "./PlayGallery";
import {
  PLAY_CATEGORIES,
  GRID_ORDER,
  type PlayCategory,
} from "@/lib/play";
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
  const [filter, setFilter] = useState<PlayCategory | "all">("all");

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
        <div className={styles.gridView}>
          <header className={`container ${styles.head}`}>
            <h1 className={`display ${styles.title}`}>
              Building, tinkering, and connecting the dots between tech +
              creativity.
            </h1>
          </header>
          {/* Pinned to the right edge on desktop so the categories stay
              reachable at any scroll position. Sits in the DOM directly
              above the grid, which is where it lands on narrow screens
              once the panel drops back into normal flow. */}
          <nav className={styles.filters} aria-label="Play categories">
            <p className={`eyebrow ${styles.filtersLabel}`}>Categories</p>
            {(["all", ...GRID_ORDER] as const).map((id) => {
              const label =
                id === "all"
                  ? "All"
                  : PLAY_CATEGORIES.find((c) => c.id === id)!.label;
              return (
                <button
                  key={id}
                  className={`${styles.shortcut} ${
                    filter === id ? styles.shortcutActive : ""
                  }`}
                  aria-pressed={filter === id}
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              );
            })}
          </nav>
          <PlayGrid filter={filter} />
        </div>
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
