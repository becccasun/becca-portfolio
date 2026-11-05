import type { CSSProperties, ElementType, HTMLAttributes } from "react";
import { cx } from "../components/cx";
import s from "./layout.module.css";

// Layout: the scaffolding a new screen starts from. Gaps take a step on the spacing
// scale (gap={24} is var(--space-24)), so nothing gets an off-scale number.
export type Space = 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 20 | 24 | 28 | 32 | 40 | 48 | 64 | 72 | 96 | 120;
const space = (n?: Space) => (n === undefined ? undefined : `var(--space-${n})`);
type Box = { as?: ElementType } & HTMLAttributes<HTMLElement>;

/** The page frame: centred at a layout width, clear of the fixed header.
 *  width: col (reading, 960), wide (1040), page (works grid, 1146). */
export function Page({ as: Tag = "main", width = "page", className, ...rest }: Box & { width?: "col" | "wide" | "page" }) {
  return <Tag className={cx(s.page, s[width], className)} {...rest} />;
}

/** A band of the page. divider draws the hairline on top. */
export function Section({ as: Tag = "section", divider, className, ...rest }: Box & { divider?: boolean }) {
  return <Tag className={cx(s.section, divider && s.divider, className)} {...rest} />;
}

/** Children in a column (or a row), a spacing step apart. */
export function Stack({ as: Tag = "div", gap = 16, row, align, wrap, className, style, ...rest }:
  Box & { gap?: Space; row?: boolean; align?: CSSProperties["alignItems"]; wrap?: boolean }) {
  return <Tag className={cx(s.stack, row && s.row, wrap && s.wrap, className)} style={{ gap: space(gap), alignItems: align, ...style }} {...rest} />;
}

/** Equal columns that fall to one column under 720px. min switches to auto-fill at that track width. */
export function Grid({ as: Tag = "div", cols = 2, min, gap = 20, className, style, ...rest }:
  Box & { cols?: 1 | 2 | 3 | 4; min?: number; gap?: Space }) {
  const columns = min ? `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))` : `repeat(${cols}, minmax(0, 1fr))`;
  return <Tag className={cx(s.grid, !min && s.collapse, className)} style={{ gap: space(gap), gridTemplateColumns: columns, ...style }} {...rest} />;
}
