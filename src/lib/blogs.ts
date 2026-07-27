export type BlogPost = {
  id: string;
  /** Recency: highest shows first. Bump past the current max when adding. */
  added: number;
  title: string;
  year: string;
  href: string;
  /** Where the writing lives; drives the cursor label ("Read on Medium"). */
  source: "Medium" | "Substack" | "Personal site";
  image: string;
  /** One line of what the piece argues, shown in the list. */
  blurb: string;
};

/**
 * Long-form writing, listed newest first. Lived on /play as a category
 * until it earned its own page.
 */
export const BLOG_POSTS: BlogPost[] = [
  {
    id: "design-diary",
    added: 6,
    title: "Design school diary",
    year: "2026",
    href: "#",
    source: "Medium",
    image: "/blog/design-diary.svg",
    blurb: "Notes from the middle of a design degree, written as they happened.",
  },
  {
    id: "notes-on-taste",
    added: 5,
    title: "Notes on taste",
    year: "2026",
    href: "#",
    source: "Medium",
    image: "/blog/notes-on-taste.svg",
    blurb: "What people mean when they say a designer has taste, and whether it can be taught.",
  },
  {
    id: "prototype-first",
    added: 4,
    title: "Prototype first, argue later",
    year: "2025",
    href: "#",
    source: "Medium",
    image: "/blog/prototype-first.svg",
    blurb: "A clickable artifact ends a debate faster than a better argument does.",
  },
  {
    id: "design-notes",
    added: 3,
    title: "Design notes, written up",
    year: "2025",
    href: "#",
    source: "Medium",
    image: "/blog/design-notes.svg",
    blurb: "Turning a scattered pile of process notes into something worth rereading.",
  },
  {
    id: "ascii-love",
    added: 2,
    title: "On ASCII art",
    year: "2025",
    href: "#",
    source: "Medium",
    image: "/blog/ascii-love.svg",
    blurb: "Why the most constrained medium on the computer is still the most expressive.",
  },
  {
    id: "hackathon-lessons",
    added: 1,
    title: "What hackathons taught me",
    year: "2024",
    href: "#",
    source: "Medium",
    image: "/blog/hackathon-lessons.svg",
    blurb: "Six weekends of building badly, and the habits that survived them.",
  },
];
