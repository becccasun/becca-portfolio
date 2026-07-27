export const SITE = {
  name: "Rebecca Sun",
  wordmark: "REBECCA SUN",
  tagline:
    "Product design at Loop Financial, studying UX and AI at the University of Michigan.",
  email: "beccasun@umich.edu",
  url: "https://www.rebeccasun.me",
  mediumHandle: "becccasun",
  medium: "https://medium.com/@becccasun",
};

export type TimelineEntry = {
  date: string;
  title: string;
  detail: string;
  href?: string;
};

/** Home experience timeline. Order carries real information. */
export const TIMELINE: TimelineEntry[] = [
  {
    date: "2026",
    title: "Loop",
    detail: "Product design and frontend",
    href: "/work/loop",
  },
  {
    date: "Spring 2026",
    title: "Embedder",
    detail: "Design engineering",
    href: "/work/embedder",
  },
  {
    date: "2025",
    title: "A/Squared",
    detail: "Member, product teams",
  },
  {
    date: "2025",
    title: "DPSS",
    detail: "Design and research",
    href: "/work/dpss",
  },
  {
    date: "2025",
    title: "AgentMail",
    detail: "Product engineering",
    href: "/work/agentmail",
  },
  {
    date: "2024",
    title: "Nezha",
    detail: "Founding design",
    href: "/work/nezha",
  },
];
