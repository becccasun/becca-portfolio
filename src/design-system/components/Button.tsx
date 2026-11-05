import type { ComponentProps } from "react";
import { cx } from "./cx";
import s from "./Button.module.css";

type ButtonOwn = { shape?: "pill" | "rect"; size?: "sm" | "md" | "lg" };
export type ButtonProps = ButtonOwn & ({ href: string } & ComponentProps<"a"> | { href?: undefined } & ComponentProps<"button">);

/** Primary action. pill/lg is the dark hero pill, pill/sm the Send button, rect/md the case-study link-out.
 *  Pass href to render a link. Figma: Button (Shape, Size, State). */
export function Button({ shape = "pill", size = "lg", className, ...rest }: ButtonProps) {
  const cls = cx(s.button, s[shape], s[size], className);
  if (rest.href !== undefined) return <a className={cls} {...(rest as ComponentProps<"a">)} />;
  return <button className={cls} {...(rest as ComponentProps<"button">)} />;
}
