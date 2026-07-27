export type PlayCategory = "crafts" | "digital" | "photo";

export type PlayItem = {
  id: string;
  /** Recency: highest = added to the site most recently, shows first
   *  in the grid. Bump past the current max when adding a new piece. */
  added: number;
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

export const PLAY_CATEGORIES: { id: PlayCategory; label: string }[] = [
  { id: "crafts", label: "Arts & crafts" },
  { id: "digital", label: "Digital explorations" },
  { id: "photo", label: "Photography & videography" },
];

/** Filter-tab order in the grid view ("All" is prepended in the UI). */
export const GRID_ORDER: PlayCategory[] = ["digital", "crafts", "photo"];

/**
 * 18 placeholder pieces, salon-hung across the room's four walls with
 * staggered heights. Writing used to hang on a fourth wall and now lives
 * at /blogs, so the remaining pieces are spread 5/5/4/4 rather than
 * leaving a bare wall. Swap titles, hrefs, and images for the real work.
 */
export const PLAY_ITEMS: PlayItem[] = [
  // Wall 0
  { id: "poster-01", added: 15, title: "Poster study 01", year: "2025", href: "#", source: "Figma", image: "/play/poster-01.svg", category: "crafts", wall: 0, x: 90, y: -70, w: 320 },
  { id: "zine-spread", added: 6, title: "Zine spread", year: "2024", href: "#", source: "Medium", image: "/play/zine-spread.svg", category: "crafts", wall: 0, x: 480, y: 90, w: 280 },
  { id: "riso-print", added: 5, title: "Risograph print", year: "2024", href: "#", source: "Live site", image: "/play/riso-print.svg", category: "crafts", wall: 0, x: 850, y: -110, w: 240 },
  { id: "sticker-sheet", added: 16, title: "Sticker sheet", year: "2025", href: "#", source: "Live site", image: "/play/sticker-sheet.svg", category: "crafts", wall: 0, x: 1200, y: 70, w: 300 },
  { id: "mural-mockup", added: 4, title: "Mural mockup", year: "2024", href: "#", source: "Live site", image: "/play/mural-mockup.svg", category: "crafts", wall: 0, x: 1560, y: -80, w: 260 },

  // Wall 1
  { id: "days-of-type", added: 17, title: "36 days of type", year: "2025", href: "#", source: "Medium", image: "/play/days-of-type.svg", category: "crafts", wall: 1, x: 90, y: -70, w: 320 },
  { id: "mhacks", added: 24, title: "MHacks 2026 site", year: "2026", href: "https://mhacks.org", source: "Live site", image: "/play/mhacks.svg", category: "digital", wall: 1, x: 480, y: 90, w: 280 },
  { id: "nezha-mvp", added: 3, title: "Nezha MVP, one-night build", year: "2024", href: "#", source: "Devpost", image: "/play/nezha-mvp.svg", category: "digital", wall: 1, x: 850, y: -110, w: 240 },
  { id: "hshv", added: 14, title: "HSHV adoption flow", year: "2025", href: "#", source: "Figma", image: "/play/hshv.svg", category: "digital", wall: 1, x: 1200, y: 70, w: 300 },
  { id: "wolverine", added: 13, title: "Wolverine Club page", year: "2025", href: "#", source: "Live site", image: "/play/wolverine.svg", category: "digital", wall: 1, x: 1560, y: -80, w: 260 },

  // Wall 2
  { id: "figma-toy", added: 22, title: "Figma plugin toy", year: "2026", href: "#", source: "Figma", image: "/play/figma-toy.svg", category: "digital", wall: 2, x: 140, y: -80, w: 330 },
  { id: "gen-sketch", added: 23, title: "Generative sketch", year: "2026", href: "https://github.com/becccasun", source: "GitHub", image: "/play/gen-sketch.svg", category: "digital", wall: 2, x: 620, y: 90, w: 300 },
  { id: "photo-series", added: 12, title: "Photo series", year: "2025", href: "#", source: "Live site", image: "/play/photo-series.svg", category: "photo", wall: 2, x: 1090, y: -100, w: 280 },
  { id: "process-reel", added: 20, title: "Process reel", year: "2026", href: "#", source: "YouTube", image: "/play/process-reel.svg", category: "photo", wall: 2, x: 1540, y: 70, w: 300 },

  // Wall 3
  { id: "motion-study", added: 21, title: "Motion study", year: "2026", href: "#", source: "YouTube", image: "/play/motion-study.svg", category: "photo", wall: 3, x: 140, y: -80, w: 330 },
  { id: "blender-doodle", added: 11, title: "Blender doodle", year: "2025", href: "#", source: "YouTube", image: "/play/blender-doodle.svg", category: "photo", wall: 3, x: 620, y: 90, w: 300 },
  { id: "album-riff", added: 2, title: "Album shoot", year: "2024", href: "#", source: "Live site", image: "/play/album-riff.svg", category: "photo", wall: 3, x: 1090, y: -100, w: 280 },
  { id: "artmuseum", added: 10, title: "Museum photo walk", year: "2025", href: "#", source: "Live site", image: "/play/artmuseum.svg", category: "photo", wall: 3, x: 1540, y: 70, w: 300 },
];
