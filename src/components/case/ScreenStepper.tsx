"use client";
import { useEffect, useState } from "react";
import s from "./blocks.module.css";

// Click-through of a flow from screenshots: steps on the left, screens crossfade on the
// right. Advances on its own until someone clicks a step (or prefers reduced motion).
export default function ScreenStepper({ steps, caption, interval = 3200 }: {
  steps: { label: string; src: string }[];
  caption?: string;
  interval?: number;
}) {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % steps.length), interval);
    return () => clearInterval(t);
  }, [auto, steps.length, interval]);

  return (
    <figure className={`${s.media} ${s.wide}`}>
      <div className={s.stepper}>
        <ol className={s.stepList}>
          {steps.map((st, n) => (
            <li key={st.src}>
              <button
                type="button"
                className={n === i ? s.stepOn : undefined}
                onClick={() => { setI(n); setAuto(false); }}
              >
                <span className={s.stepNum}>{n + 1}</span>{st.label}
              </button>
            </li>
          ))}
        </ol>
        <div className={`${s.well} ${s.stepScreens}`}>
          {steps.map((st, n) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={st.src} src={st.src} alt={st.label} className={n === i ? s.screenOn : undefined} />
          ))}
        </div>
      </div>
      {caption && <figcaption className={s.caption}>{caption}</figcaption>}
    </figure>
  );
}
