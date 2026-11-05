import type { ComponentProps } from "react";
import { cx } from "./cx";
import s from "./TextField.module.css";

/** Single-line input. Focus and invalid draw a 1.5px ring. Figma: Text Field (State). */
export function TextField({ invalid, className, ...rest }: { invalid?: boolean } & ComponentProps<"input">) {
  return <label className={cx(s.field, invalid && s.invalid, className)}><input aria-invalid={invalid || undefined} {...rest} /></label>;
}
