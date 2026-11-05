import type { ComponentProps } from "react";
import { cx } from "./cx";
import s from "./Tag.module.css";

/** A static label. solid sits on cards ("Chosen"), overlay sits on images ("Before"). Figma: Tag (Variant). */
export function Tag({ variant = "solid", className, ...rest }: { variant?: "solid" | "overlay" } & ComponentProps<"span">) {
  return <span className={cx(s.tag, variant === "solid" ? s.solid : s.overlay, className)} {...rest} />;
}
