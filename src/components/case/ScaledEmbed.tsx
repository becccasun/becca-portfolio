"use client";
import { useEffect, useRef, useState } from "react";
import s from "./blocks.module.css";

// A live site rendered at a real desktop viewport, then scaled down to fit the column,
// so it lays out (and works) the way it does on a laptop instead of falling to its mobile layout.
// It only loads once the reader asks for it: some embedded apps scroll their own frame into view
// on load, which drags the whole case study down with them.
export default function ScaledEmbed({ src, title, poster, width = 1440, height = 900 }: {
  src: string; title: string; poster: string; width?: number; height?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / width);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <figure className={`${s.media} ${s.wide}`}>
      <div className={s.browser}>
        <div className={s.browserBar}>
          <span aria-hidden className={s.dots}><i /><i /><i /></span>
          <span className={s.browserUrl}>{src.replace(/^https?:\/\//, "")}</span>
          <a href={src} target="_blank" rel="noreferrer" className={s.browserOpen}>Open in new tab ↗</a>
        </div>
        <div ref={box} className={s.scaledBox} style={{ aspectRatio: `${width} / ${height}` }}>
          {!live && (
            <button type="button" className={s.embedPoster} onClick={() => setLive(true)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={poster} alt="" />
              <span className={s.embedPlay}>Try it live</span>
            </button>
          )}
          {live && scale > 0 && (
            <iframe
              src={src}
              title={title}
              style={{ width, height, transform: `scale(${scale})` }}
              className={s.scaledFrame}
            />
          )}
        </div>
      </div>
    </figure>
  );
}
