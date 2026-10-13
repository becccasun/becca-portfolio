// All copy and project data lives here. Everything is placeholder: swap in your own.
import { PORTFOLIO_URL } from "@/lib/portfolio";

// Selected works, in display order. Each opens /work/<slug>. Entries without an image show a
// blank panel; kicker and blurb are optional.
export const works: { slug: string; title: string; kicker?: string; blurb?: string; image?: string; fit?: "contain"; bg?: string; pad?: string; comingSoon?: boolean }[] = [
  { slug: "loop-onboarding", title: "Loop Client Onboarding", kicker: "PRODUCT DESIGN INTERN \u2022 SUMMER 2026", blurb: "Designing and prototyping an end-to-end fintech product onboarding flow.", image: "/work/loop-onboarding/onboarding.jpg" },
  { slug: "feature-discovery", title: "Feature Discovery UX Research", kicker: "LEAD USER RESEARCHER + DESIGNER \u2022 SPRING 2026", blurb: "Spearheaded high signal qualitative research & user interviews with Firmware Engineers", image: "/works/embedder.png" },
  { slug: "aspect", title: "Aspect", kicker: "PRODUCT DESIGN CONSULTANT \u2022 FALL 2026", blurb: "Lightweight agent harness that makes the AE video editing process hassle-free.", image: "/works/aspect.png", comingSoon: true },
  { slug: "design-mcp", title: "Design MCP + Agentic Design System", kicker: "PRODUCT DESIGN INTERN \u2022 FALL 2026", blurb: "Building an original design skill MCP that operates autonomously with a refreshed token and component system.", image: "/work/design-mcp/cover-fit.jpg?v=3", fit: "contain", bg: "#a9d3bf" },
  { slug: "mhacks", title: "MHacks Design Suite", kicker: "DESIGN CHAIR \u2022 2026", blurb: "Led a four-person team on one brand of flowers and ASCII across a website, two mini games, print, merch and stage", image: "/work/mhacks/site-hero.jpg", fit: "contain", bg: "#bec59b", pad: "7% 8%" },
  { slug: "agentmail", title: "AgentMail Product Demo", kicker: "PRODUCT DESIGNER \u2022 FALL 2025", blurb: "Designed an interactive landing-page demo that shows an AI agent sending email from three perspectives", image: "/works/agentmail.png" },
];

// Credits band along the bottom of the hero
export const heroBand = {
  tagline: "Rebecca is a full-stack designer building artful experiences.",
  roles: [
    { text: "Studying UX + AI @ UMich", logo: "/logos/umich.png?v=2" },
    { text: "Design Chair @ MHacks", logo: "/logos/mhacks.png" },
    { text: "Product Design @ Loop", logo: "/logos/loop.png" },
  ],
};

export const site = {
  name: "Rebecca Sun",
  role: "Product Designer",
  // Work scrolls to the homepage grid; About, Play and Writing are their own pages.
  nav: [
    { label: "Work", href: "/#work" },
    { label: "About", href: "/about" },
    { label: "Play", href: "/play" },
    { label: "Writing", href: "/writing" },
  ],
  // hero tagline; empty means none (removed for now — the zine strips carry the hero)
  heroLead: "",
  // optional grey second line under the tagline; empty means none
  heroBody: "",
};

export type Project = {
  name: string;
  tags: string[];
  title: string;
  accent: string;
  mockup: "phones" | "desktop";
  hue: [string, string];
  quote: string;
  author?: { name: string; role: string };
  badges?: string[];
  impact?: { value: string; label: string; delta: string }[];
};

export const projects: Project[] = [
  {
    name: "Project One",
    tags: ["iOS app", "Consumer", "Product design", "Strategy"],
    title: "A one-line summary of the first project",
    accent: "rgb(163, 119, 8)",
    mockup: "phones",
    hue: ["#f6d98b", "#8fd3c7"],
    quote:
      "A placeholder pull quote from press or a client that describes what the product does and why it mattered.",
    badges: ["Award placeholder", "#1 Placeholder of the Week"],
    impact: [
      { value: "00%", label: "metric one", delta: "00% higher than baseline" },
      { value: "0.0%", label: "metric two", delta: "00% higher than baseline" },
      { value: "00%", label: "metric three", delta: "00% higher than baseline" },
    ],
  },
  {
    name: "Project Two",
    tags: ["Web app", "B2B", "Product design"],
    title: "A one-line summary of the second project",
    accent: "rgb(57, 77, 158)",
    mockup: "desktop",
    hue: ["#bcd6f5", "#5fb3c4"],
    quote:
      "A placeholder testimonial from a founder or product lead about the collaboration and its outcome.",
    author: { name: "Client Name,", role: "Role at Company" },
  },
  {
    name: "Project Three",
    tags: ["iOS app", "Consumer", "Product design"],
    title: "A one-line summary of the third project",
    accent: "rgb(227, 67, 9)",
    mockup: "phones",
    hue: ["#ffc2a8", "#f07a5a"],
    quote:
      "Another placeholder quote. Keep it to three or four lines so the column stays balanced against the title.",
  },
  {
    name: "Project Four",
    tags: ["Web app", "B2B", "AI"],
    title: "A one-line summary of the fourth project",
    accent: "rgb(30, 148, 150)",
    mockup: "desktop",
    hue: ["#c9eee9", "#6cc3bf"],
    quote:
      "A final placeholder testimonial that talks about speed, clarity and the product that shipped.",
    author: { name: "Client Name,", role: "Role at Company" },
  },
];

export const stats = [
  [{ value: 10, suffix: "", label: "Years in the field" }],
  [
    { value: 5, suffix: "", label: "Years independent" },
    { value: 30, suffix: "+", label: "Teams worked with" },
    { value: 70, suffix: "%", label: "Repeat clients" },
  ],
  [
    { value: 1, suffix: "", label: "Side project shipped" },
    { value: 999, suffix: "", label: "Cups of coffee" },
  ],
];

export const about = {
  heading: "I help teams:",
  points: [
    "Frame fuzzy product problems",
    "Turn ideas into working experiences",
    "Prototype, test and ship quickly",
    "Pair closely with engineering",
  ],
  location: "Based in City, Country. Working with teams anywhere.",
};

export const services = {
  left: { label: "What I work on", items: ["Product direction", "Product design", "Zero-to-one products", "Messy problems"] },
  right: { label: "Product types", items: ["AI tools", "Mobile apps", "Web apps", "Complex workflows"] },
};

export const letter = {
  heading: ["A heading for", "your short letter"],
  paragraphs: [
    "Open with a sentence or two about the kind of situations you are usually brought into.",
    "Then a paragraph about your background: how long you have been doing this and where.",
    "A paragraph about how you work with a team, rather than what you hand over.",
    "Close with an invitation to get in touch.",
    "Sign-off.",
  ],
  signature: ["With love from City,", "Your Name"],
};

export const faq = {
  title: "Frequently asked questions",
  items: [
    { q: "What is working together like?", a: "Placeholder answer. Describe the rhythm of a typical engagement." },
    { q: "How long do projects run?", a: "Placeholder answer. Give a typical range and what drives it." },
    { q: "How is pricing structured?", a: "Placeholder answer. Explain the model without listing numbers." },
    { q: "Do you take every project?", a: "Placeholder answer. Say what makes a good fit." },
    { q: "Tell me about the side project?", a: "Placeholder answer. One or two lines and a link." },
    { q: "I have another question. Where do I ask?", a: "Placeholder answer. Point to email or the booking link." },
  ],
};

export const askAi = {
  kicker: "Need more context?",
  title: "Ask an assistant whether I'm a good fit for your project",
  buttons: ["Ask ChatGPT", "Ask Claude", "Ask Google"],
};

// Hero stamps. Names, dates and artwork are placeholders: swap freely.
// Art lives in a 100 × 125 box; the panel is x 8–92, y 8–114.5. Shapes are blurred by `blur`.
export type GeneratedArt = {
  from: string;
  to: string;
  blur: number;
  shapes: { cx: number; cy: number; rx: number; ry: number; fill: string; rot?: number; o?: number }[];
};
/** A real image, cropped to fill the art panel. `align` is an SVG preserveAspectRatio
    alignment (default "xMidYMid") for choosing which part of a wider image shows. */
export type ImageArt = { image: string; align?: string };

export type StampData = {
  /** not printed on the stamp; read out as the stamp button's label */
  name: [string, string];
  date: string;
  art: GeneratedArt | ImageArt;
};

export const stamps: StampData[] = [
  // Rebecca's paintings (web copies in public/stamps). Names are placeholders; dates
  // follow the photo folders where they say a month, the capture date otherwise.
  { name: ["Green", "Hills"], date: "08/2026", art: { image: "/stamps/hills.jpg" } },
  { name: ["Blue", "Orchids"], date: "08/2026", art: { image: "/stamps/orchids.jpg" } },
  { name: ["Lily", "Pads"], date: "08/2026", art: { image: "/stamps/lily-pads.jpg" } },
  // landscape painting: the portrait stamp shows its middle (earth's edge, the comet, the stars)
  { name: ["Shooting", "Star"], date: "07/2026", art: { image: "/stamps/space.jpg", align: "xMidYMid" } },
];
