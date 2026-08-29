"use client";

import { useEffect, useRef } from "react";
import { SITE } from "@/lib/site";
import FortuneBottle from "./FortuneBottle";
import VisitorCount from "./VisitorCount";
import styles from "./Footer.module.css";

/**
 * Drawer footer: fixed beneath the page, revealed as the content above
 * scrolls away (emmiwu.com-style). A ResizeObserver publishes the
 * footer's height as --footer-h, which main uses as bottom margin so
 * the scroll length accounts for the hidden drawer.
 *
 * The reserved interaction slot (spec item 9) is now the fortune
 * bottle: corked, floating in the top right, holding a note.
 */
export default function Footer() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      document.documentElement.style.setProperty(
        "--footer-h",
        `${entry.contentRect.height}px`
      );
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--footer-h");
    };
  }, []);

  return (
    <footer className={styles.footer} ref={ref}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brandRow}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Rebecca Sun logo" className={styles.logo} />
          <p className={`serif ${styles.signoff}`}>
            Infer the unspoken, build the unbuilt.
          </p>
        </div>

        <div className={styles.playSlot} data-footer-interaction-slot>
          <FortuneBottle />
        </div>

        <div className={styles.meta}>
          <a href={`mailto:${SITE.email}`} className="link">
            {SITE.email}
          </a>
          <div className={styles.links}>
            <a
              href="https://www.linkedin.com/"
              className="link"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/"
              className="link"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              href={SITE.medium}
              className="link"
              target="_blank"
              rel="noreferrer"
            >
              Medium
            </a>
            <a
              href="https://x.com/beqscreatives"
              className="link"
              target="_blank"
              rel="noreferrer"
            >
              X
            </a>
            <a href="/resume.pdf" className="link">
              Resume
            </a>
          </div>
          <p className={styles.colophon}>
            © {new Date().getFullYear()} {SITE.name}. Designed and built by me.
          </p>
          {/* Renders nothing until it has a number, so the footer never
              reserves space for a line that may not arrive. */}
          <VisitorCount />
        </div>
      </div>
    </footer>
  );
}
