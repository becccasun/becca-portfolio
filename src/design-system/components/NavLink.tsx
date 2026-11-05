import type { ComponentProps } from "react";
import { cx } from "./cx";
import s from "./NavLink.module.css";

/** Header page link. Pass current to sit it in the grey pill. Figma: Nav Link (State). */
export function NavLink({ current, className, ...rest }: { current?: boolean } & ComponentProps<"a">) {
  return <a className={cx(s.navLink, className)} aria-current={current ? "page" : undefined} {...rest} />;
}
