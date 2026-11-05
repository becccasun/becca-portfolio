import type { ComponentProps } from "react";
import { cx } from "./cx";
import s from "./Well.module.css";

/** Framed media slot for screenshots and video. Figma: Well. */
export function Well({ className, ...rest }: ComponentProps<"div">) {
  return <div className={cx(s.well, className)} {...rest} />;
}
