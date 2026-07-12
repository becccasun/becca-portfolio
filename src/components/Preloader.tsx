"use client";

import { useEffect, useState } from "react";
import styles from "./Preloader.module.css";

const GREETING = "Hi, I’m Rebecca!";
const SEEN_KEY = "preloader-seen";

/**
 * One orchestrated moment before first paint of the page proper.
 * Runs once per session; reduced-motion gets an instant fade.
 */
export default function Preloader() {
  const [phase, setPhase] = useState<"idle" | "playing" | "leaving" | "done">(
    "idle"
  );

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY)) {
      setPhase("done");
      return;
    }
    sessionStorage.setItem(SEEN_KEY, "1");

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      const t = setTimeout(() => setPhase("done"), 400);
      setPhase("leaving");
      return () => clearTimeout(t);
    }

    setPhase("playing");
    const leave = setTimeout(() => setPhase("leaving"), 1600);
    const done = setTimeout(() => setPhase("done"), 2300);
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, []);

  if (phase === "done" || phase === "idle") return null;

  return (
    <div
      className={`${styles.overlay} ${
        phase === "leaving" ? styles.leaving : ""
      }`}
      aria-hidden="true"
    >
      <p className={`serif ${styles.greeting}`}>
        {GREETING.split("").map((ch, i) => (
          <span
            key={i}
            className={styles.char}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {ch === " " ? " " : ch}
          </span>
        ))}
      </p>
    </div>
  );
}
