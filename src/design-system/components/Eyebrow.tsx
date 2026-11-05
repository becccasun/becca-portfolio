import type { ComponentProps } from "react";
import { cx } from "./cx";
import s from "./Eyebrow.module.css";

/** Caps label above facts and section groups. Figma: Eyebrow. */
export function Eyebrow({ className, ...rest }: ComponentProps<"p">) {
  return <p className={cx(s.eyebrow, className)} {...rest} />;
}
