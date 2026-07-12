/**
 * Client-safe half of the bottle domain: shared types and the palette
 * of papers and ASCII icons. The server-only storage half lives in
 * bottle.ts, which re-exports these.
 */

export type BottleMessage = {
  id: string;
  text: string;
  /** Empty string means anonymous. */
  name: string;
  color: PaperColor;
  icon: IconId;
  approved: boolean;
  createdAt: string;
};

export const PAPER_COLORS = [
  { id: "cream", hex: "#FAF3E3" },
  { id: "mist", hex: "#EAF2EC" },
  { id: "blush", hex: "#F6ECEF" },
  { id: "sky", hex: "#E9F0F8" },
  { id: "lilac", hex: "#F0ECF8" },
] as const;

export type PaperColor = (typeof PAPER_COLORS)[number]["id"];

export const ICONS = {
  flower: " _ _\n( v )\n \\|/\n  |",
  sun: " \\ /\n- o -\n / \\",
  star: " /\\\n<  >\n \\/",
  wave: " ~^~\n~^~^~",
  sprout: " \\./\n  |",
} as const;

export type IconId = keyof typeof ICONS;

export const ICON_IDS = Object.keys(ICONS) as IconId[];
