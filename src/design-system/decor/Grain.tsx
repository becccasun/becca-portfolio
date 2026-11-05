import { useId } from "react";
import s from "./decor.module.css";

/** Film or paper grain laid over its parent (which needs position: relative).
 *  The same fractal noise the stamps use, at --grain-alpha. */
export function Grain({ frequency = 0.9, seed = 11 }: { frequency?: number; seed?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={s.grain} aria-hidden width="100%" height="100%">
      <filter id={`${id}-g`}>
        <feTurbulence type="fractalNoise" baseFrequency={frequency} numOctaves={3} seed={seed} stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.32  0 0 0 0 0.26  0 0 0 1 0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id}-g)`} />
    </svg>
  );
}
