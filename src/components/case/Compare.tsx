"use client";
import { useState } from "react";
import s from "./blocks.module.css";

// Before/after: drag to wipe between two same-size images.
export default function Compare({ before, after, beforeLabel = "Before", afterLabel = "After", caption, ratio = "1600 / 1000" }: {
  before: string; after: string; beforeLabel?: string; afterLabel?: string; caption?: string; ratio?: string;
}) {
  const [pos, setPos] = useState(50);
  return (
    <figure className={`${s.media} ${s.wide}`}>
      <div className={`${s.well} ${s.compare}`} style={{ "--pos": `${pos}%`, aspectRatio: ratio } as React.CSSProperties}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={after} alt={afterLabel} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={before} alt={beforeLabel} className={s.compareTop} />
        <span className={s.compareLine} aria-hidden />
        <span className={`${s.compareTag} ${s.compareTagL}`}>{beforeLabel}</span>
        <span className={`${s.compareTag} ${s.compareTagR}`}>{afterLabel}</span>
        <input
          type="range" min={0} max={100} value={pos}
          onChange={(e) => setPos(+e.target.value)}
          aria-label={`Drag to compare ${beforeLabel} and ${afterLabel}`}
          className={s.compareRange}
        />
      </div>
      {caption && <figcaption className={s.caption}>{caption}</figcaption>}
    </figure>
  );
}
