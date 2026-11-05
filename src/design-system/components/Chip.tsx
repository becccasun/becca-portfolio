import type { ComponentProps } from "react";
import { cx } from "./cx";
import s from "./Chip.module.css";

/** A tappable suggestion, like the chat's starter questions. Figma: Chip (State). */
export function Chip({ className, ...rest }: ComponentProps<"button">) {
  return <button className={cx(s.chip, className)} {...rest} />;
}
