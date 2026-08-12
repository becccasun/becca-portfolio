export type PlayCategory = "crafts" | "digital" | "photo";

export type PlayItem = {
  id: string;
  /** Recency: highest = added to the site most recently, shows first
   *  in the grid. Bump past the current max when adding a new piece. */
  added: number;
  title: string;
  year: string;
  /**
   * Original work: the material it was made in, shown in place of the
   * source line. Its presence also marks the piece as the artefact
   * itself — there is no site to link out to, so the tile and the wall
   * label both drop the link rather than pointing at "#".
   */
  medium?: string;
  href?: string;
  /** Where the link goes; drives the cursor label ("View on Devpost"). */
  source?:
    | "Devpost"
    | "Medium"
    | "GitHub"
    | "Figma"
    | "YouTube"
    | "Dropbox"
    | "Live site";
  image: string;
  /**
   * Wall-label copy, shown when a piece is selected in the gallery.
   * Absent on the placeholder pieces — the panel just drops the line
   * rather than inventing one.
   */
  blurb?: string;
  category: PlayCategory;
  /**
   * Set to false for work that belongs in the grid but not on a wall —
   * the design journals are digital pieces that only exist as a PDF, so
   * they take no slot in the room. The wall/x/y/w below are ignored for
   * those, and their slots leave the hang entirely.
   */
  hangs?: false;
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
 * 22 pieces in the grid, 20 of them salon-hung across the room's four
 * walls with staggered heights (4/6/5/5). Writing used to hang on a
 * fourth wall and now lives at /blogs. The two design journals are
 * digital work with nothing physical to hang, so they set hangs: false
 * and their slots come out of the room. The print work and the four
 * original paintings are real; the rest are still placeholders — swap
 * titles, hrefs, and images as the work lands.
 *
 * The wall groupings are a pool of hanging slots rather than the final
 * arrangement: the gallery deals pieces onto them in a fixed shuffle so
 * the walls read as mixed instead of sorted by category. Landscape
 * pieces hang shorter than portrait ones at the same width.
 */
export const PLAY_ITEMS: PlayItem[] = [
  // Wall 0
  { id: "asquared", added: 27, title: "a/squared Magazine", year: "2024–2026", href: "https://www.asquaredmag.org/", source: "Live site", image: "/play/asquared/cover.png", blurb: "Editorial and graphic design for a/squared, the University of Michigan's fastest-growing creative magazine. VP Design through 2024\u201325, President in 2026, across print issues and the publication's own site.", category: "digital", wall: 0, x: 100, y: -70, w: 380 },
  { id: "agree-to-disagree", added: 26, title: "Agree to Disagree: Design Journal", year: "2025", href: "https://www.dropbox.com/scl/fi/ql0l8afskotungcwwlpgx/Rebecca-Sun-2025-Creative-Notebook.pdf?rlkey=3qx5oxgkpkqsmoxf4ha6p6oom&st=h8czd0xf&dl=0", source: "Dropbox", image: "/play/agree-to-disagree.png", blurb: "The 2025 edition of a self-initiated annual design journal, printed. A year of studies, notes and unfinished ideas, kept as a record of how the work changed.", category: "digital", hangs: false, wall: 0, x: 395, y: 90, w: 300 },
  { id: "map-the-mind", added: 25, title: "Map the Mind: Design Journal", year: "2024", href: "https://www.dropbox.com/scl/fi/ltcp4n49u5c2syp5eqelj/Rebecca-Sun-Fall-2024-Notebook.pdf?rlkey=rea0pv7fh2vtjmgehbe9p9hdh&st=0c9xxtp1&dl=0", source: "Dropbox", image: "/play/map-the-mind.png", blurb: "The 2024 edition of the same annual design journal, and the first one printed. Sketches, type studies and course work collected into a single bound volume.", category: "digital", hangs: false, wall: 0, x: 710, y: -110, w: 290 },
  { id: "control-devil", added: 31, title: "Control Devil", year: "2022", medium: "Colored pencils", image: "/play/paintings/control-devil.jpg", category: "crafts", wall: 0, x: 540, y: 70, w: 360 },
  { id: "sticker-sheet", added: 16, title: "Sticker sheet", year: "2025", href: "#", source: "Live site", image: "/play/sticker-sheet.svg", category: "crafts", wall: 0, x: 960, y: -90, w: 350 },
  { id: "mural-mockup", added: 4, title: "Mural mockup", year: "2024", href: "#", source: "Live site", image: "/play/mural-mockup.svg", category: "crafts", wall: 0, x: 1370, y: 80, w: 340 },

  // Wall 1
  { id: "days-of-type", added: 17, title: "36 days of type", year: "2025", href: "#", source: "Medium", image: "/play/days-of-type.svg", category: "crafts", wall: 1, x: 60, y: -80, w: 320 },
  { id: "mhacks", added: 24, title: "MHacks 2026 site", year: "2026", href: "https://mhacks.org", source: "Live site", image: "/play/mhacks.svg", blurb: "The 2026 marketing site for Michigan's flagship hackathon, built around a digital-garden concept: Michigan wildflowers labelled like specimens, and an MCP server you can apply through.", category: "digital", wall: 1, x: 395, y: 80, w: 300 },
  { id: "timelapse-of-the-future", added: 30, title: "Timelapse of the Future", year: "2022", medium: "Oil paint", image: "/play/paintings/timelapse-of-the-future.jpg", category: "crafts", wall: 1, x: 710, y: -100, w: 290 },
  { id: "nezha-mvp", added: 3, title: "Nezha MVP, one-night build", year: "2024", href: "#", source: "Devpost", image: "/play/nezha-mvp.svg", category: "digital", wall: 1, x: 1015, y: 60, w: 270 },
  { id: "hshv", added: 14, title: "HSHV adoption flow", year: "2025", href: "#", source: "Figma", image: "/play/hshv.svg", category: "digital", wall: 1, x: 1300, y: -90, w: 250 },
  { id: "wolverine", added: 13, title: "Wolverine Club page", year: "2025", href: "#", source: "Live site", image: "/play/wolverine.svg", category: "digital", wall: 1, x: 1565, y: 70, w: 240 },

  // Wall 2
  { id: "figma-toy", added: 22, title: "Figma plugin toy", year: "2026", href: "#", source: "Figma", image: "/play/figma-toy.svg", category: "digital", wall: 2, x: 100, y: -80, w: 350 },
  { id: "gen-sketch", added: 23, title: "Generative sketch", year: "2026", href: "https://github.com/becccasun", source: "GitHub", image: "/play/gen-sketch.svg", category: "digital", wall: 2, x: 470, y: 90, w: 330 },
  { id: "state-of-monotony", added: 29, title: "State of Monotony", year: "2023", medium: "Charcoal", image: "/play/paintings/state-of-monotony.jpg", category: "crafts", wall: 2, x: 820, y: -100, w: 310 },
  { id: "photo-series", added: 12, title: "Photo series", year: "2025", href: "#", source: "Live site", image: "/play/photo-series.svg", category: "photo", wall: 2, x: 1150, y: 70, w: 290 },
  { id: "process-reel", added: 20, title: "Process reel", year: "2026", href: "#", source: "YouTube", image: "/play/process-reel.svg", category: "photo", wall: 2, x: 1460, y: -90, w: 280 },

  // Wall 3
  { id: "motion-study", added: 21, title: "Motion study", year: "2026", href: "#", source: "YouTube", image: "/play/motion-study.svg", category: "photo", wall: 3, x: 100, y: -90, w: 350 },
  { id: "sin-city", added: 28, title: "Sin City", year: "2023", medium: "Ink", image: "/play/paintings/sin-city.jpg", category: "crafts", wall: 3, x: 470, y: 70, w: 330 },
  { id: "blender-doodle", added: 11, title: "Blender doodle", year: "2025", href: "#", source: "YouTube", image: "/play/blender-doodle.svg", category: "photo", wall: 3, x: 820, y: -110, w: 310 },
  { id: "album-riff", added: 2, title: "Album shoot", year: "2024", href: "#", source: "Live site", image: "/play/album-riff.svg", category: "photo", wall: 3, x: 1150, y: 80, w: 290 },
  { id: "artmuseum", added: 10, title: "Museum photo walk", year: "2025", href: "#", source: "Live site", image: "/play/artmuseum.svg", category: "photo", wall: 3, x: 1460, y: -70, w: 280 },
];
