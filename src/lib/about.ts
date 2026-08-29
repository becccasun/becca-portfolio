/**
 * Content for the About deck: five full-viewport slides — summary,
 * artist statement, education and experience, campus involvement, and
 * the toolkit map — and then the footer.
 */

export type Club = {
  id: string;
  /** The description-side artwork, exported from the Framer original. */
  card: string;
  /** The photo-side artwork, shown on hover. Both states are the
   *  original Framer exports, so the swap matches the old site exactly. */
  photo: string;
  name: string;
  role: string;
  /** Read out in place of the card image, which carries text as pixels. */
  description: string;
};

export const CLUBS: Club[] = [
  {
    id: "atlas",
    card: "/about/card-atlas.png",
    photo: "/about/photo-atlas.png",
    name: "Atlas Digital Technology Consulting Group",
    role: "Project Manager + Product Designer",
    description:
      "Atlas Digital is a student consulting organization at the University of Michigan focused on providing technological and design-oriented solutions to businesses, startups, and nonprofits.",
  },
  {
    id: "asquared",
    card: "/about/card-asquared.png",
    photo: "/about/photo-asquared.png",
    name: "a/squared Magazine",
    role: "President + Prev. Vice President of Design",
    description:
      "A/Squared is a community driven platform and publication united around fashion, culture, and arts in Ann Arbor. Our aim is to cultivate meaningful digital and physical experiences through creative expression and collaboration.",
  },
  {
    id: "mhacks",
    card: "/about/card-mhacks.png",
    photo: "/about/photo-mhacks.png",
    name: "MHacks (UMich Hackathon)",
    role: "Director of Design",
    description:
      "MHacks is the University of Michigan's largest hackathon with over 1000+ annual hackers. The events connect thousands of students of all experience levels with opportunities to experiment, innovate, and collaborate.",
  },
  {
    id: "shift",
    card: "/about/card-shift.png",
    photo: "/about/photo-shift.png",
    name: "Shift Creator Space",
    role: "Creator",
    description:
      "Shift is a community of designers, hackers, artists, entrepreneurs, and researchers at the University of Michigan driven by the common mission to build dope stuff outside of the classroom.",
  },
];

export type Role = {
  org: string;
  title: string;
  period: string;
};

/** Paid work only — campus roles live on the involvement panel. */
export const ROLES: Role[] = [
  {
    org: "Loop Financial",
    title: "Product Design Intern",
    period: "2026",
  },
  {
    org: "Embedder (YC S25)",
    title: "Project Manager + UX Researcher",
    period: "Feb – Apr 2026",
  },
  {
    org: "AgentMail (YC S25)",
    title: "Product Designer",
    period: "2025",
  },
  {
    org: "Department of Public Safety and Security",
    title: "Product Designer",
    period: "2025",
  },
];

export type School = {
  id: string;
  school: string;
  credential: string;
  /** Focus, minors, honours: whatever the credential alone doesn't say. */
  detail?: string;
  period: string;
};

/** Left-hand column of the education and experience slide. */
export const EDUCATION: School[] = [
  {
    id: "umich",
    school: "University of Michigan",
    credential: "BS in Information, UX design",
    detail: "Minors in architecture and artificial intelligence · 3.9 GPA",
    period: "2024 — now",
  },
  {
    id: "uvic",
    school: "University of Vic",
    credential: "Business and product design",
    detail: "Studied abroad in Barcelona",
    period: "Abroad",
  },
];

export type Shot = {
  id: string;
  /** Photograph, once one exists. Placeholder frame until then. */
  src?: string;
  /** Read out on hover — what the photograph is of. */
  context: string;
};

/**
 * The speaking photographs on the artist-statement slide, stacked in
 * the bottom-right. They render as placeholder frames until Rebecca
 * adds `src`; the stack draws whatever this array holds, so going from
 * two shots to three is one entry and no layout work.
 */
export const SPEAKING: Shot[] = [
  { id: "class", context: "Speaking to a class" },
  { id: "tedx", context: "On the TEDx stage" },
  { id: "demo", context: "Presenting a product to an audience" },
];

export type Tool = {
  id: string;
  name: string;
  /** -1 explorative … +1 goal-oriented. */
  x: number;
  /** -1 human … +1 agentic. */
  y: number;
  /** Sticker artwork, once it exists. Falls back to a lettered chip. */
  art?: string;
};

/**
 * The toolkit map. Two axes: what the work is for (explorative to
 * goal-oriented) crossed with whose hands are on it (human to agentic).
 * Positions are the whole content here, so they are meant to be argued
 * with and edited — move a number, move the sticker.
 */
export const TOOLKIT: Tool[] = [
  { id: "figma", name: "Figma", x: 0.45, y: -0.7 },
  { id: "figjam", name: "FigJam", x: -0.55, y: -0.55 },
  { id: "blender", name: "Blender", x: -0.7, y: -0.85 },
  { id: "procreate", name: "Procreate", x: -0.85, y: -0.6 },
  { id: "claude", name: "Claude Code", x: -0.3, y: 0.8 },
  { id: "cursor", name: "Cursor", x: 0.5, y: 0.65 },
  { id: "v0", name: "v0", x: -0.5, y: 0.45 },
  { id: "next", name: "Next.js", x: 0.75, y: 0.15 },
  { id: "storybook", name: "Storybook", x: 0.8, y: -0.25 },
  { id: "linear", name: "Linear", x: 0.85, y: -0.6 },
];
