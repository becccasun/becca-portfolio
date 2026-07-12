"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import styles from "./Hero.module.css";

const PHOTOS = ["/hero/photo-1.svg", "/hero/photo-2.svg", "/hero/photo-3.svg"];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % PHOTOS.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className={`container ${styles.hero}`}>
      <div className={styles.copy}>
        <p className="eyebrow">Design engineer · Ann Arbor, MI</p>
        <h1 className={`serif ${styles.title}`}>
          I design interfaces,
          <br />
          then I build them.
        </h1>
        <p className={styles.positioning}>{SITE.tagline}</p>
        <div className={styles.actions}>
          <a href="#work" className="link">
            See selected work
          </a>
          <a href={`mailto:${SITE.email}`} className="link">
            Get in touch
          </a>
        </div>
      </div>

      <div className={styles.photos} data-cursor aria-label="Photos of Rebecca">
        {PHOTOS.map((src, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={src}
            src={src}
            alt=""
            className={`${styles.photo} ${i === index ? styles.visible : ""}`}
          />
        ))}
      </div>
    </section>
  );
}
