export type PlayItem = {
  id: string;
  title: string;
  year: string;
  href: string;
  /** Where the link goes; drives the cursor label ("View on Devpost"). */
  source: "Devpost" | "Medium" | "GitHub" | "Figma" | "YouTube" | "Live site";
  image: string;
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

/**
 * 24 placeholder pieces, six per wall, salon-hung with staggered heights.
 * Swap titles, hrefs, and images for the real work.
 */
export const PLAY_ITEMS: PlayItem[] = [
  // Wall 0 — facing you at load
  { id: "mhacks", title: "MHacks 2026 site", year: "2026", href: "https://mhacks.org", source: "Live site", image: "/play/mhacks.svg", wall: 0, x: 90, y: -60, w: 340 },
  { id: "nezha-mvp", title: "Nezha MVP, one-night build", year: "2024", href: "#", source: "Devpost", image: "/play/nezha-mvp.svg", wall: 0, x: 500, y: 90, w: 250 },
  { id: "hshv", title: "HSHV adoption flow", year: "2025", href: "#", source: "Figma", image: "/play/hshv.svg", wall: 0, x: 820, y: -110, w: 230 },
  { id: "wolverine", title: "Wolverine Club page", year: "2025", href: "#", source: "Live site", image: "/play/wolverine.svg", wall: 0, x: 1120, y: 70, w: 300 },
  { id: "numberguess", title: "Number guessing game", year: "2024", href: "https://github.com/becccasun", source: "GitHub", image: "/play/numberguess.svg", wall: 0, x: 1490, y: -80, w: 220 },
  { id: "artmuseum", title: "Art museum data dig", year: "2025", href: "https://github.com/becccasun", source: "GitHub", image: "/play/artmuseum.svg", wall: 0, x: 1740, y: 100, w: 210 },

  // Wall 1 — to the right
  { id: "design-notes", title: "Design notes, written up", year: "2025", href: "#", source: "Medium", image: "/play/design-notes.svg", wall: 1, x: 110, y: 40, w: 240 },
  { id: "process-reel", title: "Process reel", year: "2026", href: "#", source: "YouTube", image: "/play/process-reel.svg", wall: 1, x: 430, y: -100, w: 330 },
  { id: "django-recipes", title: "Recipes app, Django", year: "2025", href: "https://github.com/becccasun", source: "GitHub", image: "/play/django-recipes.svg", wall: 1, x: 830, y: 90, w: 260 },
  { id: "poster-01", title: "Poster study 01", year: "2025", href: "#", source: "Figma", image: "/play/poster-01.svg", wall: 1, x: 1160, y: -70, w: 230 },
  { id: "type-specimen", title: "Type specimen", year: "2025", href: "#", source: "Figma", image: "/play/type-specimen.svg", wall: 1, x: 1450, y: 80, w: 250 },
  { id: "zine-spread", title: "Zine spread", year: "2024", href: "#", source: "Medium", image: "/play/zine-spread.svg", wall: 1, x: 1740, y: -90, w: 210 },

  // Wall 2 — behind you
  { id: "gen-sketch", title: "Generative sketch", year: "2026", href: "https://github.com/becccasun", source: "GitHub", image: "/play/gen-sketch.svg", wall: 2, x: 100, y: -80, w: 280 },
  { id: "icon-set", title: "Icon set", year: "2025", href: "#", source: "Figma", image: "/play/icon-set.svg", wall: 2, x: 450, y: 90, w: 230 },
  { id: "album-riff", title: "Album art riff", year: "2024", href: "#", source: "Live site", image: "/play/album-riff.svg", wall: 2, x: 760, y: -100, w: 250 },
  { id: "photo-series", title: "Photo series", year: "2025", href: "#", source: "Live site", image: "/play/photo-series.svg", wall: 2, x: 1080, y: 70, w: 320 },
  { id: "riso-print", title: "Risograph print", year: "2024", href: "#", source: "Live site", image: "/play/riso-print.svg", wall: 2, x: 1470, y: -70, w: 220 },
  { id: "motion-study", title: "Motion study", year: "2026", href: "#", source: "YouTube", image: "/play/motion-study.svg", wall: 2, x: 1740, y: 90, w: 220 },

  // Wall 3 — to the left
  { id: "hack-badge", title: "Hackathon badge system", year: "2026", href: "#", source: "Devpost", image: "/play/hack-badge.svg", wall: 3, x: 90, y: 60, w: 260 },
  { id: "blender-doodle", title: "Blender doodle", year: "2025", href: "#", source: "YouTube", image: "/play/blender-doodle.svg", wall: 3, x: 430, y: -90, w: 240 },
  { id: "sticker-sheet", title: "Sticker sheet", year: "2025", href: "#", source: "Live site", image: "/play/sticker-sheet.svg", wall: 3, x: 740, y: 80, w: 230 },
  { id: "figma-toy", title: "Figma plugin toy", year: "2026", href: "#", source: "Figma", image: "/play/figma-toy.svg", wall: 3, x: 1040, y: -80, w: 260 },
  { id: "mural-mockup", title: "Mural mockup", year: "2024", href: "#", source: "Live site", image: "/play/mural-mockup.svg", wall: 3, x: 1370, y: 90, w: 300 },
  { id: "days-of-type", title: "36 days of type", year: "2025", href: "#", source: "Medium", image: "/play/days-of-type.svg", wall: 3, x: 1740, y: -60, w: 210 },
];
