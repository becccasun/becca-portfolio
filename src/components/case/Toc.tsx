"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { WorkSection } from "@/lib/work";
import styles from "./Toc.module.css";

/**
 * Sticky table of contents. The section currently in view is tracked
 * with an IntersectionObserver and rendered in accent; entries are
 * clickable anchors.
 */
export default function Toc({ sections }: { sections: WorkSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <nav className={styles.toc} aria-label="Case study contents">
      <Link href="/work" className={styles.back}>
        ← All work
      </Link>
      <p className="eyebrow">Contents</p>
      <ol className={styles.list}>
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={`${styles.entry} ${
                active === s.id ? styles.active : ""
              }`}
            >
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
