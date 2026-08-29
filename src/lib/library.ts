/**
 * The secret library: games, toys, and small tools, reached by pulling
 * the string at the top of the hero. Not linked from the nav — finding
 * it is the point.
 *
 * Everything here ships as a placeholder until Rebecca has the real
 * artwork and the builds to point at. A magnet with `placeholder: true`
 * draws as an empty slot rather than pretending to be a finished thing.
 * To put a real build on the shelf, fill in `title`, `blurb` and `href`,
 * drop the flag, and add `art` once there is a sticker for it:
 *
 *   { id: "typing", x: 22, y: 30, rotate: -4, size: 20,
 *     title: "Speed run", blurb: "A typing game", href: "https://…",
 *     art: "/library/typing.png" }
 *
 * Positions are percentages of the panel, so the arrangement keeps its
 * shape at any window size. Nothing here is ordered — it is a wall, not
 * a list — but the array order does decide paint order where two
 * magnets overlap.
 */
export type Magnet = {
  id: string;
  /** Percent of the panel, from its left edge and top edge. */
  x: number;
  y: number;
  /** Degrees. Nothing sits perfectly straight on a real board. */
  rotate: number;
  /** Width as a percent of the panel. Height follows the shape. */
  size: number;
  /** Rounded rectangle, circle, or a strip of tape. */
  shape: "block" | "round" | "strip";
  title: string;
  blurb?: string;
  href?: string;
  /** Sticker artwork, once it exists. Falls back to a drawn magnet. */
  art?: string;
  /** True while this is an empty slot waiting on a real build. */
  placeholder?: boolean;
};

export const MAGNETS: Magnet[] = [
  { id: "slot-1", x: 9,  y: 14, rotate: -5, size: 9,  shape: "block", title: "Empty slot", placeholder: true },
  { id: "slot-2", x: 31, y: 10, rotate: 3,  size: 8,  shape: "round", title: "Empty slot", placeholder: true },
  { id: "slot-3", x: 53, y: 15, rotate: -2, size: 10, shape: "block", title: "Empty slot", placeholder: true },
  { id: "slot-4", x: 76, y: 11, rotate: 6,  size: 11, shape: "strip", title: "Empty slot", placeholder: true },
  { id: "slot-5", x: 15, y: 48, rotate: 4,  size: 8,  shape: "round", title: "Empty slot", placeholder: true },
  { id: "slot-6", x: 36, y: 52, rotate: -6, size: 10, shape: "block", title: "Empty slot", placeholder: true },
  { id: "slot-7", x: 59, y: 47, rotate: 2,  size: 9,  shape: "block", title: "Empty slot", placeholder: true },
  { id: "slot-8", x: 80, y: 53, rotate: -4, size: 11, shape: "strip", title: "Empty slot", placeholder: true },
];
