import s from "./ZineField.module.css";
import { withBase } from "@/lib/base";

/*
  Accordion-folded zine strips filling the hero, made from Rebecca's own publications:
  her ARCH 208 design notebook ("Map the Mind") on top and again in the middle
  (picking up at page 32 of the PDF), her Design Notebook 2025 at the bottom. Pages are in reading order: the
  cover, then each spread split into its left and right page (public/zine, cut from
  the print PDFs). Every panel is the same height; each strip's pages are as wide as
  its publication's page proportions, so nothing is cropped.

  The fold is one number, --fold (registered in globals.css so it can animate). Each
  panel narrows by cos(fold) and rises or falls by sin(fold); alternate panels lean
  opposite ways, so the row zigzags like a folded strip seen from slightly above.
  On load each row unfolds from nearly shut. Hovering a row lays it out flat, widening
  from its centre, and it folds back up when the pointer leaves.
*/

// Bump when the page images are re-cut: the files keep their names, so without this
// a browser that already has the old cut keeps showing it.
const VERSION = 5; // 5: middle strip back to ARCH 208, from PDF page 32

/** spreads `from`–`to` (PDF page numbers) split into left and right pages */
const spreads = (prefix: string, from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => String(from + i).padStart(2, "0")).flatMap((n) => [
    `${prefix}${n}-l`,
    `${prefix}${n}-r`,
  ]);

/** a notebook's cover, then spreads `from`–`to` split into left and right pages */
const notebook = (prefix: string, from: number, to: number) => [
  `${prefix}01`,
  ...Array.from({ length: to - from + 1 }, (_, i) => String(from + i).padStart(2, "0")).flatMap((n) => [
    `${prefix}${n}-l`,
    `${prefix}${n}-r`,
  ]),
];

// page width ÷ height, from the PDFs
const NOTEBOOK_PAGE = 449 / 638;

const ARCH_208 = notebook("", 2, 7).slice(0, 12); // 12 pages
const ARCH_208_FROM_32 = spreads("", 32, 37).slice(0, 11); // 11 pages, from PDF page 32
const NOTEBOOK_2025 = notebook("dn25-", 2, 6); // 11 pages

// three strips of differing length, each nudged sideways so they don't line up
const ROWS = [
  { pages: ARCH_208, ratio: NOTEBOOK_PAGE, shift: -48 },
  { pages: ARCH_208_FROM_32, ratio: NOTEBOOK_PAGE, shift: 56 },
  { pages: NOTEBOOK_2025, ratio: NOTEBOOK_PAGE, shift: -8 },
];

export default function ZineField() {
  return (
    <div className={s.field} role="img" aria-label="Pages from Rebecca's ARCH 208 notebook, Map the Mind, and her Design Notebook 2025, folded into zine strips">
      {ROWS.map((row, r) => (
        <div key={r} className={s.row} style={{ "--shift": `${row.shift}px`, "--row": r, "--n": row.pages.length, "--ratio": row.ratio } as React.CSSProperties}>
          {row.pages.map((page, i) => (
            <div key={page} className={s.panel} data-lean={i % 2 ? "down" : "up"} style={{ "--i": i } as React.CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={withBase(`/zine/${page}.jpg?v=${VERSION}`)} alt="" height={341} decoding="async" draggable={false} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
