"use client";

import { useEffect, useRef } from "react";
import { SITE } from "@/lib/site";
import styles from "./Footer.module.css";

/**
 * Drawer footer: fixed beneath the page, revealed as the content above
 * scrolls away (emmiwu.com-style). A ResizeObserver publishes the
 * footer's height as --footer-h, which main uses as bottom margin so
 * the scroll length accounts for the hidden drawer.
 *
 * The playful interaction concept is still TBD with Rebecca (spec
 * item 9); the reserved slot remains.
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
        <p className={`serif ${styles.signoff}`}>
          Say hi, I read everything.
        </p>

        <div className={styles.playSlot} data-footer-interaction-slot />

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
            <a href="/resume.pdf" className="link">
              Resume
            </a>
          </div>
          <p className={styles.colophon}>
            © {new Date().getFullYear()} {SITE.name}. Designed and built by me.
          </p>
        </div>
      </div>
    </footer>
  );
}
