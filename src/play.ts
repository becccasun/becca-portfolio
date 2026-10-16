// Play board: a message board (Notes.tsx) and two columns of cards. w and h are the media's own pixel size, so each card
// holds its proportions before load. type defaults to "image"; videos autoplay muted on loop.
// A card with an href opens it in a new tab and lifts on hover; without one it stays flat.
export type PlayColumnId = "notes" | "art" | "digital";

export type PlayItem = {
  src: string; w: number; h: number; title: string; note?: string; type?: "image" | "video";
  column: PlayColumnId;
  date: string; // display string; a month or just a year is fine
  href?: string;
};

// Descriptions are drafts for Rebecca to rewrite.
// Left to right: notes, then crafts, then the widest column, digital.
export const playColumns: { id: PlayColumnId; title: string; description: string }[] = [
  { id: "notes", title: "Message Board", description: "What you're thinking about, or just hi. I read each one before it goes up." },
  { id: "art", title: "Arts and Crafts", description: "Paint, pencil, charcoal and ink. Made by hand, mostly for myself." },
  { id: "digital", title: "Digital Explorations", description: "Journals, posters, code, motion and the web: things I made along the way." },
];

// Dates marked "guess" still need checking.
export const playItems: PlayItem[] = [
  // Digital Explorations
  { column: "digital", date: "2025", src: "/play/editorial-journal.png", w: 1200, h: 773, title: "Editorial Design Journal", note: "Self-initiated annual journal, 2025 edition" },
  { column: "digital", date: "Jan 2025", src: "/play/asquared-poster.jpg", w: 1200, h: 1500, title: "An A/Squared Affair", note: "Winter 25 launch party poster" },
  { column: "digital", date: "Oct 2026", src: "/play/stage.jpg", w: 944, h: 590, title: "On stage", note: "Hackathon" }, // guess
  { column: "digital", date: "2025", src: "/play/touchdesigner.jpg", w: 1200, h: 780, title: "Hand tracking", note: "TouchDesigner + MediaPipe" }, // guess
  { column: "digital", date: "2025", src: "/play/umi.jpg", w: 1200, h: 773, title: "UMI", note: "Brand identity" }, // guess
  { column: "digital", date: "2024", src: "/play/old-portfolio.jpg", w: 1200, h: 627, title: "An earlier portfolio", note: "Web design" }, // guess

  // Arts and Crafts
  { column: "art", date: "2024", src: "/play/paintings-studio.jpg", w: 1200, h: 1800, title: "Paintings, in the studio", note: "Oil on canvas" }, // guess
  { column: "art", date: "2024", src: "/play/hourglass.jpg", w: 976, h: 1404, title: "Hourglass", note: "Oil on canvas" }, // guess
  { column: "art", date: "2023", src: "/play/self-portraits.jpg", w: 1068, h: 1402, title: "Self-portraits", note: "Coloured pencil" }, // guess
  { column: "art", date: "2023", src: "/play/charcoal.jpg", w: 1200, h: 898, title: "Still life", note: "Charcoal" }, // guess
  { column: "art", date: "2023", src: "/play/las-vegas.jpg", w: 1200, h: 898, title: "Las Vegas Strip", note: "Ink wash" },
];
