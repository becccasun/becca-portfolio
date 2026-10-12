"use client";
import { useState } from "react";
import s from "./blocks.module.css";

type Slide = {
  label: string;
  src: string;
  /** image width ÷ height, so pins land on the image wherever it's letterboxed */
  ar: number;
  bg?: string;
  /** numbered pins on the image, in the same order as note.points */
  pins?: { x: number; y: number }[];
  note?: { title: string; points?: string[] };
  /** unused since notes moved under the image; kept so existing slides still type-check */
  noteAt?: "left" | "right";
};

// Numbered slideshow of zoomed-in boards; the active slide's takeaways sit underneath as a legend for its pins.
export default function Slideshow({ slides, ratio = "16 / 9", caption }: { slides: Slide[]; ratio?: string; caption?: string }) {
  const [i, setI] = useState(0);
  const go = (d: number) => setI((n) => (n + d + slides.length) % slides.length);

  return (
    <figure className={`${s.media} ${s.wide} ${s.good}`}>
      <div className={s.slideNav}>
        <ol className={s.slideTabs}>
          {slides.map((sl, n) => (
            <li key={sl.src}>
              <button type="button" className={n === i ? s.slideTabOn : undefined} onClick={() => setI(n)}>
                <span className={s.stepNum}>{n + 1}</span>{sl.label}
              </button>
            </li>
          ))}
        </ol>
        <span className={s.slideArrows}>
          <button type="button" onClick={() => go(-1)} aria-label="Previous">←</button>
          <button type="button" onClick={() => go(1)} aria-label="Next">→</button>
        </span>
      </div>
      <div className={`${s.well} ${s.slides}`} style={{ aspectRatio: ratio, background: slides[i]?.bg }}>
        {slides.map((sl, n) => (
          <div key={sl.src} className={`${s.slide} ${n === i ? s.slideOn : ""}`} aria-hidden={n !== i}>
            <div className={s.slideImg} style={{ "--ar": sl.ar } as React.CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sl.src} alt={sl.label} loading="lazy" />
              {sl.pins?.map((p, k) => (
                <span key={k} className={s.mark} style={{ left: `${p.x}%`, top: `${p.y}%` }}>{k + 1}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {slides.some((sl) => sl.note) && (
        <div className={s.legends}>
          {slides.map((sl, n) => sl.note && (
            <div key={sl.src} className={s.legend} aria-hidden={n !== i} style={{ visibility: n === i ? "visible" : "hidden" }}>
              <p className={s.legendTitle}>{sl.note.title}</p>
              {sl.note.points && (
                <ol className={`${s.marks} ${sl.note.points.every((pt) => pt.length <= 60) ? s.marksTwo : ""}`}>
                  {sl.note.points.map((pt, k) => <li key={k}><span className={s.markNum}>{k + 1}</span>{pt}</li>)}
                </ol>
              )}
            </div>
          ))}
        </div>
      )}
      {caption && <figcaption className={s.caption}>{caption}</figcaption>}
    </figure>
  );
}
