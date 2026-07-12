export type PlayItem = {
  id: string;
  title: string;
  year: string;
  href: string;
  /** Where the link goes; drives the cursor label ("View on Devpost"). */
  source: "Devpost" | "Medium" | "GitHub" | "Figma" | "YouTube" | "Live site";
  image: string;
  /** Position and width on the infinite canvas plane. */
  x: number;
  y: number;
  w: number;
};

/** Virtual plane the canvas tiles infinitely. Keep wider than any viewport. */
export const PLANE = { w: 3600, h: 2400 };

/**
 * Placeholder set. Swap hrefs and images for the real pieces; positions
 * are hand-scattered so the initial canvas view shows two or three items.
 */
export const PLAY_ITEMS: PlayItem[] = [
  {
    id: "mhacks",
    title: "MHacks 2026 site",
    year: "2026",
    href: "https://mhacks.org",
    source: "Live site",
    image: "/play/mhacks.svg",
    x: 180,
    y: 200,
    w: 380,
  },
  {
    id: "nezha-mvp",
    title: "Nezha MVP, one-night build",
    year: "2024",
    href: "#",
    source: "Devpost",
    image: "/play/nezha-mvp.svg",
    x: 820,
    y: 950,
    w: 320,
  },
  {
    id: "hshv",
    title: "HSHV adoption flow",
    year: "2025",
    href: "#",
    source: "Figma",
    image: "/play/hshv.svg",
    x: 1450,
    y: 260,
    w: 300,
  },
  {
    id: "wolverine",
    title: "Wolverine Club page",
    year: "2025",
    href: "#",
    source: "Live site",
    image: "/play/wolverine.svg",
    x: 2050,
    y: 1150,
    w: 340,
  },
  {
    id: "numberguess",
    title: "Number guessing game",
    year: "2024",
    href: "https://github.com/becccasun",
    source: "GitHub",
    image: "/play/numberguess.svg",
    x: 2650,
    y: 480,
    w: 280,
  },
  {
    id: "artmuseum",
    title: "Art museum data dig",
    year: "2025",
    href: "https://github.com/becccasun",
    source: "GitHub",
    image: "/play/artmuseum.svg",
    x: 3120,
    y: 1550,
    w: 320,
  },
  {
    id: "design-notes",
    title: "Design notes, written up",
    year: "2025",
    href: "#",
    source: "Medium",
    image: "/play/design-notes.svg",
    x: 950,
    y: 1750,
    w: 300,
  },
  {
    id: "process-reel",
    title: "Process reel",
    year: "2026",
    href: "#",
    source: "YouTube",
    image: "/play/process-reel.svg",
    x: 1950,
    y: 1880,
    w: 340,
  },
  {
    id: "django-recipes",
    title: "Recipes app, Django",
    year: "2025",
    href: "https://github.com/becccasun",
    source: "GitHub",
    image: "/play/django-recipes.svg",
    x: 2900,
    y: 2050,
    w: 300,
  },
];
