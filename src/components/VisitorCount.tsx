"use client";

import { useEffect, useState } from "react";
import styles from "./VisitorCount.module.css";

const STORAGE_KEY = "rs:visitor-number";

/**
 * "You are visitor #123!" — the number a reader was given the first
 * time they came, kept in their own browser afterwards.
 *
 * Asking the server on every load would make the tally count page views
 * rather than people, and would give the same reader a different number
 * on every refresh, which makes the sentence a lie. So the number is
 * requested once and then remembered: the writes to the database are
 * first visits, and what a returning reader sees is the number they
 * already had.
 *
 * Renders nothing at all until it has a number. It is a small delight
 * at the bottom of a page, so a failed request should leave no trace
 * rather than an error or an empty frame.
 */
export default function VisitorCount() {
  const [number, setNumber] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const remembered = Number(window.localStorage.getItem(STORAGE_KEY));
    if (Number.isInteger(remembered) && remembered > 0) {
      setNumber(remembered);
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/visitors", { method: "POST" });
        if (!res.ok) return;
        const data = (await res.json()) as { number?: number };
        if (cancelled || typeof data.number !== "number") return;
        window.localStorage.setItem(STORAGE_KEY, String(data.number));
        setNumber(data.number);
      } catch {
        // Offline, blocked, or the store is down. Say nothing.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (number === null) return null;

  return (
    <p className={styles.count}>
      You are visitor{" "}
      <span className={styles.number}>#{number.toLocaleString()}</span>!
    </p>
  );
}
