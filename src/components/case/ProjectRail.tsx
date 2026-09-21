"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { WorkSection } from "@/lib/work";
import styles from "./ProjectRail.module.css";

export type RailProject = {
  slug: string;
  label: string;
  sections: WorkSection[];
};

type RailProps = {
  parent: { slug: string; title: string };
  projects: RailProject[];
  /** null when we're on the umbrella hub itself. */
  activeSlug: string | null;
};

/**
 * The switcher for a multi-project umbrella (Loop). Takes the place of
 * Toc on those pages: the sibling projects stack in the rail and the one
 * you're reading expands to its own section links, so the parent/child
 * structure stays visible the whole way down the page.
 */
export default function ProjectRail({
  parent,
  projects,
  activeSlug,
}: RailProps) {
  const active = projects.find((p) => p.slug === activeSlug);
  const sections = active?.sections ?? [];
  const [current, setCurrent] = useState(sections[0]?.id ?? "");

  // Same scroll-spy Toc uses: the section in view reads in accent.
  useEffect(() => {
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
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

  return (
    <nav className={styles.rail} aria-label={`${parent.title} projects`}>
      <Link href="/work" className={styles.back}>
        ← All work
      </Link>
      <Link
        href={`/work/${parent.slug}`}
        className={`eyebrow ${styles.parent} ${
          activeSlug === null ? styles.parentActive : ""
        }`}
      >
        {parent.title}
      </Link>

      <ol className={styles.list}>
        {projects.map((p) => {
          const isActive = p.slug === activeSlug;
          return (
            <li key={p.slug}>
              <Link
                href={`/work/${p.slug}`}
                className={`${styles.project} ${
                  isActive ? styles.projectActive : ""
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {p.label}
              </Link>

              {isActive && p.sections.length > 0 && (
                <ol className={styles.sections}>
                  {p.sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className={`${styles.section} ${
                          current === s.id ? styles.sectionActive : ""
                        }`}
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Narrow-screen fallback. The rail is hidden under 960px, which would
 * hide the other projects entirely, so the siblings ride above the case
 * study header as a scrollable chip row instead.
 */
export function ProjectChips({
  parent,
  projects,
  activeSlug,
}: RailProps) {
  const scroller = useRef<HTMLElement>(null);
  const active = useRef<HTMLAnchorElement>(null);

  // Later projects start off the right edge of the row, so bring the one
  // you're reading into the middle rather than leaving it out of frame.
  useEffect(() => {
    const row = scroller.current;
    const chip = active.current;
    if (!row || !chip) return;
    row.scrollLeft =
      chip.offsetLeft - row.clientWidth / 2 + chip.clientWidth / 2;
  }, [activeSlug]);

  return (
    <nav
      ref={scroller}
      className={styles.chips}
      aria-label={`${parent.title} projects`}
    >
      <Link
        href={`/work/${parent.slug}`}
        className={`${styles.chip} ${
          activeSlug === null ? styles.chipActive : ""
        }`}
      >
        {parent.title}
      </Link>
      {projects.map((p) => (
        <Link
          key={p.slug}
          ref={p.slug === activeSlug ? active : undefined}
          href={`/work/${p.slug}`}
          className={`${styles.chip} ${
            p.slug === activeSlug ? styles.chipActive : ""
          }`}
          aria-current={p.slug === activeSlug ? "page" : undefined}
        >
          {p.label}
        </Link>
      ))}
    </nav>
  );
}
