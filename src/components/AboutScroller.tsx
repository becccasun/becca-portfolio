"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";
import styles from "./AboutScroller.module.css";

/**
 * About as a predominantly horizontal scroll (roydenso.com/info style).
 * Vertical scroll drives the track sideways: the wrapper's height equals
 * the horizontal overshoot, a sticky viewport pins the track, and the
 * track translates by the scrolled distance. Past the last frame the
 * page resumes normal vertical flow into the footer.
 * Narrow viewports and reduced motion get a plain vertical stack.
 */
export default function AboutScroller() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [horizontal, setHorizontal] = useState(false);
  const [overshoot, setOvershoot] = useState(0);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 900px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setHorizontal(wide.matches && !reduced.matches);
    update();
    wide.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!horizontal) {
      setOvershoot(0);
      if (trackRef.current) trackRef.current.style.transform = "";
      return;
    }

    const measure = () => {
      if (!trackRef.current) return;
      setOvershoot(
        Math.max(0, trackRef.current.scrollWidth - window.innerWidth)
      );
    };

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const wrapper = wrapperRef.current;
        const track = trackRef.current;
        if (!wrapper || !track) return;
        const max = track.scrollWidth - window.innerWidth;
        const scrolled = Math.min(
          Math.max(0, -wrapper.getBoundingClientRect().top),
          max
        );
        track.style.transform = `translate3d(${-scrolled}px, 0, 0)`;
      });
    };

    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [horizontal]);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} ${horizontal ? styles.isHorizontal : ""}`}
      style={horizontal ? { height: `calc(100vh + ${overshoot}px)` } : undefined}
    >
      <div className={styles.viewport}>
        <div ref={trackRef} className={styles.track}>
          <section className={styles.frame}>
            <p className="eyebrow">About</p>
            <h1 className={`serif ${styles.title}`}>
              Design and engineering,
              <br />
              same person.
            </h1>
            <p className={styles.scrollHint} aria-hidden="true">
              Keep scrolling
            </p>
          </section>

          <section className={`${styles.frame} ${styles.photoFrame}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero/photo-2.svg"
              alt="Rebecca Sun"
              className={styles.photo}
            />
          </section>

          <section className={styles.frame}>
            <p className="eyebrow">Who</p>
            <p className={styles.body}>
              I&apos;m Rebecca, a design engineer studying at the University
              of Michigan. I care about interfaces that are{" "}
              <span className={styles.accented}>fast to understand</span> and
              feel considered, and I like owning the whole path from a Figma
              frame to a deployed component.
            </p>
          </section>

          <section className={styles.frame}>
            <p className="eyebrow">Now</p>
            <p className={styles.body}>
              Currently building at{" "}
              <a href="/work/loop" className={styles.accented}>
                Loop
              </a>{" "}
              and{" "}
              <a href="/work/embedder" className={styles.accented}>
                Embedder
              </a>
              , and previously with DPSS, AgentMail, and Nezha. The details
              live in the case studies.
            </p>
          </section>

          <section className={styles.frame}>
            <p className="eyebrow">Affinities</p>
            <ul className={styles.affinities}>
              <li>Design systems that survive contact with engineers</li>
              <li>Motion that earns its place</li>
              <li>Prototypes over decks</li>
              <li>Interfaces you can scan in one pass</li>
            </ul>
          </section>

          <section className={`${styles.frame} ${styles.endFrame}`}>
            <p className={`serif ${styles.endLine}`}>
              That&apos;s the short version.
            </p>
            <p className={styles.body}>
              For the rest,{" "}
              <a href={`mailto:${SITE.email}`} className={styles.accented}>
                email me
              </a>{" "}
              or ask the chat in the corner.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
