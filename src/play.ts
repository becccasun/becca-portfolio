// Play board: a message board (Notes.tsx) and two columns of cards. w and h are the media's own pixel size, so each card
// holds its proportions before load. type defaults to "image"; videos autoplay muted on loop.
// A card with an href opens it in a new tab and lifts on hover; without one it stays flat.
export type PlayColumnId = "notes" | "art" | "digital";

export type PlayItem = {
  src: string; w: number; h: number; title: string; note?: string; type?: "image" | "video";
  column: PlayColumnId;
  date: string; // display string; a month or just a year is fine
  href?: string;
  preview?: string; // a muted clip that plays over the still image while the card is hovered
  book?: { slug: string; pages: number }; // a flip book from public/play/books/<slug>, shown instead of src
  // A painting shown as a 3D stretched canvas. long = its longer side in inches, depth = its profile.
  // Canvas cards show only the date and medium; title is kept as the alt text.
  canvas?: { long: number; depth: number };
};

// Descriptions are drafts for Rebecca to rewrite.
// Left to right: notes, then crafts, then the widest column, digital.
export const playColumns: { id: PlayColumnId; title: string; description: string }[] = [
  { id: "notes", title: "Message Board", description: "What you're thinking about, or just hi. I read each one before it goes up." },
  { id: "art", title: "Arts and Crafts", description: "Paint, pencil and charcoal. Made by hand, mostly for myself." },
  { id: "digital", title: "Digital Explorations", description: "Journals, posters, code, motion and the web: things I made along the way." },
];

// Dates marked "guess" still need checking.
export const playItems: PlayItem[] = [
  // Digital Explorations
  { column: "digital", date: "2024", src: "/play/books/map-of-the-mind/001.webp", w: 1280, h: 909, title: "Map of the Mind", note: "Editorial Design Journal No. 1, made in InDesign in 2024", book: { slug: "map-of-the-mind", pages: 106 } },
  { column: "digital", date: "2025", src: "/play/books/agree-to-disagree/001.webp", w: 1280, h: 909, title: "Agree to Disagree", note: "Editorial Design Journal No. 2, made in InDesign in 2025", book: { slug: "agree-to-disagree", pages: 98 } },
  { column: "digital", date: "2026", src: "/play/kaleidoscope.jpg?v=2", w: 1600, h: 1135, title: "Kaleidoscope Glyph", note: "Personal project, react native" },
  { column: "digital", date: "Oct 2026", src: "/play/rivet-recap.mp4", w: 960, h: 592, type: "video", title: "Rivet", note: "Rivet at SOON Hackathon. First place overall: prompt to hardware design in seconds." },
  { column: "digital", date: "2026", src: "/play/touchdesigner.mp4", w: 960, h: 624, type: "video", title: "Hand tracking", note: "TouchDesigner + MediaPipe" },
  { column: "digital", date: "Sep 2025", src: "/play/mobilens.jpg", w: 1252, h: 1054, title: "MobiLens", note: "MobiLens at MHacks. 2x winner: AR glasses for accessible navigation." },
  { column: "digital", date: "2024", src: "/play/old-portfolio.jpg", w: 1200, h: 627, title: "An earlier portfolio", note: "Web design" }, // guess

  // Arts and Crafts: stretched canvases, newest first. Sizes are estimates until Rebecca measures them.
  { column: "art", date: "2026", src: "/play/canvas/space.jpg?v=2", w: 1000, h: 1400, title: "Shooting star", note: "Oil on canvas", canvas: { long: 7, depth: 0.625 } },
  { column: "art", date: "2026", src: "/play/canvas/lily-pads.jpg?v=2", w: 725, h: 1042, title: "Lily pads", note: "Oil on canvas", canvas: { long: 7, depth: 0.625 } },
  { column: "art", date: "2026", src: "/play/canvas/hills.jpg", w: 782, h: 1114, title: "Green hills", note: "Oil on canvas", canvas: { long: 7, depth: 0.625 } },
  { column: "art", date: "2026", src: "/play/canvas/orchids.jpg", w: 766, h: 1105, title: "Blue orchids", note: "Oil on canvas", canvas: { long: 7, depth: 0.625 } },
  { column: "art", date: "2026", src: "/play/canvas/lily-of-the-valley.jpg", w: 806, h: 1152, title: "Lily of the valley", note: "Oil on canvas", canvas: { long: 7, depth: 0.625 } },
  { column: "art", date: "2024", src: "/play/hourglass.jpg", w: 976, h: 1404, title: "Hourglass", note: "Oil on canvas", canvas: { long: 24, depth: 1.5 } }, // guess
  { column: "art", date: "2023", src: "/play/self-portraits.jpg", w: 1068, h: 1402, title: "Self-portraits", note: "Coloured pencil", canvas: { long: 24, depth: 1.5 } }, // guess
  { column: "art", date: "2023", src: "/play/charcoal.jpg", w: 1200, h: 898, title: "Still life", note: "Charcoal", canvas: { long: 24, depth: 1.5 } }, // guess
];
