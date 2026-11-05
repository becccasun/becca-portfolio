import type { ComponentProps } from "react";
import { cx } from "./cx";
import s from "./IconButton.module.css";

/** Square icon button (slideshow arrows); onDark is the round close button inside the chat bar.
 *  Always pass aria-label. Figma: Icon Button (Surface, State). */
export function IconButton({ onDark, className, ...rest }: { onDark?: boolean } & ComponentProps<"button">) {
  return <button className={cx(s.iconButton, onDark && s.onDark, className)} {...rest} />;
}
