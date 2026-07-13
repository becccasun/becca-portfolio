export type PlayCategory = "crafts" | "digital" | "photo" | "blogs";

export type PlayItem = {
  id: string;
  title: string;
  year: string;
  href: string;
  /** Where the link goes; drives the cursor label ("View on Devpost"). */
  source: "Devpost" | "Medium" | "GitHub" | "Figma" | "YouTube" | "Live site";
  image: string;
  category: PlayCategory;
  /** Which gallery wall the piece hangs on (0 = ahead at load, then clockwise). */
  wall: 0 | 1 | 2 | 3;
  /** Left edge along the wall, px from the wall's left end. */
  x: number;
  /** Vertical offset of the piece's center from the wall's midline, px. */
  y: number;
  /** Rendered width, px. */
  w: number;
};

/** Gallery room dimensions, px. Walls are ROOM.size wide, ROOM.height tall. */
export const ROOM = { size: 2000, height: 1100 };

/** One themed wall per category. */
export const PLAY_CATEGORIES: {
  id: PlayCategory;
  label: string;
  wall: 0 | 1 | 2 | 3;
}[] = [
  { id: "crafts", label: "Arts & crafts", wall: 0 },
  { id: "digital", label: "Digital explorations", wall: 1 },
  { id: "photo", label: "Photography & videography", wall: 2 },
  { id: "blogs", label: "Blogs", wall: 3 },
];

/** Section order for the grid view. */
export const GRID_ORDER: PlayCategory[] = [
  "digital",
  "blogs",
  "crafts",
  "photo",
];

/**
 * 24 placeholder pieces, six per themed wall, salon-hung with staggered
 * heights. Swap titles, hrefs, and images for the real work.
 */
export const PLAY_ITEMS: PlayItem[] = [
  // Wall 0 — Arts & crafts
  { id: "poster-01", title: "Poster study 01", year: "2025", href: "#", source: "Figma", image: "/play/poster-01.svg", category: "crafts", wall: 0, x: 90, y: -60, w: 300 },
  { id: "zine-spread", title: "Zine spread", year: "2024", href: "#", source: "Medium", image: "/play/zine-spread.svg", category: "crafts", wall: 0, x: 480, y: 90, w: 280 },
  { id: "riso-print", title: "Risograph print", year: "2024", href: "#", source: "Live site", image: "/play/riso-print.svg", category: "crafts", wall: 0, x: 830, y: -110, w: 220 },
  { id: "sticker-sheet", title: "Sticker sheet", year: "2025", href: "#", source: "Live site", image: "/play/sticker-sheet.svg", category: "crafts", wall: 0, x: 1120, y: 70, w: 260 },
  { id: "mural-mockup", title: "Mural mockup", year: "2024", href: "#", source: "Live site", image: "/play/mural-mockup.svg", category: "crafts", wall: 0, x: 1450, y: -80, w: 300 },
  { id: "days-of-type", title: "36 days of type", year: "2025", href: "#", source: "Medium", image: "/play/days-of-type.svg", category: "crafts", wall: 0, x: 1790, y: 90, w: 190 },

  // Wall 1 — Digital explorations
  { id: "mhacks", title: "MHacks 2026 site", year: "2026", href: "https://mhacks.org", source: "Live site", image: "/play/mhacks.svg", category: "digital", wall: 1, x: 90, y: -60, w: 340 },
  { id: "nezha-mvp", title: "Nezha MVP, one-night build", year: "2024", href: "#", source: "Devpost", image: "/play/nezha-mvp.svg", category: "digital", wall: 1, x: 500, y: 90, w: 250 },
  { id: "hshv", title: "HSHV adoption flow", year: "2025", href: "#", source: "Figma", image: "/play/hshv.svg", category: "digital", wall: 1, x: 820, y: -110, w: 230 },
  { id: "wolverine", title: "Wolverine Club page", year: "2025", href: "#", source: "Live site", image: "/play/wolverine.svg", category: "digital", wall: 1, x: 1120, y: 70, w: 300 },
  { id: "figma-toy", title: "Figma plugin toy", year: "2026", href: "#", source: "Figma", image: "/play/figma-toy.svg", category: "digital", wall: 1, x: 1490, y: -80, w: 240 },
  { id: "gen-sketch", title: "Generative sketch", year: "2026", href: "https://github.com/becccasun", source: "GitHub", image: "/play/gen-sketch.svg", category: "digital", wall: 1, x: 1780, y: 90, w: 200 },

  // Wall 2 — Photography & videography
  { id: "photo-series", title: "Photo series", year: "2025", href: "#", source: "Live site", image: "/play/photo-series.svg", category: "photo", wall: 2, x: 100, y: -80, w: 320 },
  { id: "process-reel", title: "Process reel", year: "2026", href: "#", source: "YouTube", image: "/play/process-reel.svg", category: "photo", wall: 2, x: 490, y: 90, w: 300 },
  { id: "motion-study", title: "Motion study", year: "2026", href: "#", source: "YouTube", image: "/play/motion-study.svg", category: "photo", wall: 2, x: 860, y: -100, w: 240 },
  { id: "blender-doodle", title: "Blender doodle", year: "2025", href: "#", source: "YouTube", image: "/play/blender-doodle.svg", category: "photo", wall: 2, x: 1170, y: 70, w: 240 },
  { id: "album-riff", title: "Album shoot", year: "2024", href: "#", source: "Live site", image: "/play/album-riff.svg", category: "photo", wall: 2, x: 1480, y: -70, w: 230 },
  { id: "artmuseum", title: "Museum photo walk", year: "2025", href: "#", source: "Live site", image: "/play/artmuseum.svg", category: "photo", wall: 2, x: 1780, y: 90, w: 200 },

  // Wall 3 — Blogs
  { id: "design-notes", title: "Design notes, written up", year: "2025", href: "#", source: "Medium", image: "/play/design-notes.svg", category: "blogs", wall: 3, x: 90, y: 60, w: 260 },
  { id: "notes-on-taste", title: "Notes on taste", year: "2026", href: "#", source: "Medium", image: "/play/notes-on-taste.svg", category: "blogs", wall: 3, x: 430, y: -90, w: 240 },
  { id: "prototype-first", title: "Prototype first, argue later", year: "2025", href: "#", source: "Medium", image: "/play/prototype-first.svg", category: "blogs", wall: 3, x: 740, y: 80, w: 230 },
  { id: "ascii-love", title: "On ASCII art", year: "2025", href: "#", source: "Medium", image: "/play/ascii-love.svg", category: "blogs", wall: 3, x: 1040, y: -80, w: 260 },
  { id: "hackathon-lessons", title: "What hackathons taught me", year: "2024", href: "#", source: "Medium", image: "/play/hackathon-lessons.svg", category: "blogs", wall: 3, x: 1370, y: 90, w: 300 },
  { id: "design-diary", title: "Design school diary", year: "2026", href: "#", source: "Medium", image: "/play/design-diary.svg", category: "blogs", wall: 3, x: 1740, y: -60, w: 210 },
];
