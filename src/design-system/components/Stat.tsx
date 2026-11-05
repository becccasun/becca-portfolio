import type { ReactNode } from "react";
import s from "./Stat.module.css";

/** A headline number with its label underneath. Wrap a row of them in a <dl>. Figma: Stat. */
export function Stat({ value, label }: { value: ReactNode; label: ReactNode }) {
  return <div className={s.stat}><dt>{label}</dt><dd>{value}</dd></div>;
}
