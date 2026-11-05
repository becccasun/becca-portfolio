import type { ComponentProps } from "react";
import { cx } from "../components/cx";
import { Grain } from "./Grain";
import s from "./decor.module.css";

export type PaperKind = "slip" | "sticky" | "letter" | "placeholder" | "stamp" | "dark";

/** A piece of paper to put things on: the base for any new handmade object.
 *  tilt is in degrees; keep it inside the kind's --tilt-* token. grain adds the paper texture.
 *  Figma: Decor / Paper (Kind). */
export function Paper({ kind = "slip", tilt = 0, grain, className, style, children, ...rest }:
  { kind?: PaperKind; tilt?: number; grain?: boolean } & ComponentProps<"div">) {
  return (
    <div className={cx(s.paper, s[kind], className)} style={{ rotate: tilt ? `${tilt}deg` : undefined, ...style }} {...rest}>
      {grain && <Grain />}
      {children}
    </div>
  );
}
