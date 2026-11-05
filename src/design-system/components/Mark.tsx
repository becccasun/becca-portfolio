import { cx } from "./cx";
import s from "./Mark.module.css";

/** Numbered pin on a screenshot. friction (red) marks problems, good (green) marks choices that work.
 *  pinned adds the white ring for use on images. Figma: Mark (Tone, Pinned). */
export function Mark({ n, tone = "friction", pinned }: { n: number; tone?: "friction" | "good"; pinned?: boolean }) {
  return <span className={cx(s.mark, tone === "good" && s.good, pinned && s.pinned)}>{n}</span>;
}
