import { cx } from "./cx";
import s from "./StepNumber.module.css";

/** Numbered step in the screen stepper and slideshow tabs. Figma: Step Number (State). */
export function StepNumber({ n, active }: { n: number; active?: boolean }) {
  return <span className={cx(s.step, active && s.on)}>{n}</span>;
}
