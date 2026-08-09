/**
 * Content for the About carousel: three full-viewport panels — intro,
 * professional experience, campus involvement — and then the footer.
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
    role: "Designer",
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
