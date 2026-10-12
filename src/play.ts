// Play gallery, in reading order (left to right, then down). w and h are the media's own
// pixel size: they set each tile's proportions so the columns can be balanced before load.
// type defaults to "image"; GIFs count as images, videos autoplay muted on loop.
export type PlayItem = { src: string; w: number; h: number; title: string; note?: string; type?: "image" | "video" };

export const playItems: PlayItem[] = [
  { src: "/play/paintings-studio.jpg", w: 1200, h: 1800, title: "Paintings, in the studio", note: "Oil on canvas" },
  { src: "/play/umi.jpg", w: 1200, h: 773, title: "UMI", note: "Brand identity" },
  { src: "/play/hourglass.jpg", w: 976, h: 1404, title: "Hourglass", note: "Oil on canvas" },
  { src: "/play/touchdesigner.jpg", w: 1200, h: 780, title: "Hand tracking", note: "TouchDesigner + MediaPipe" },
  { src: "/play/self-portraits.jpg", w: 1068, h: 1402, title: "Self-portraits", note: "Coloured pencil" },
  { src: "/play/asquared-poster.jpg", w: 1200, h: 1500, title: "An A/Squared Affair", note: "Winter 25 launch party poster" },
  { src: "/play/charcoal.jpg", w: 1200, h: 898, title: "Still life", note: "Charcoal" },
  { src: "/play/las-vegas.jpg", w: 1200, h: 898, title: "Las Vegas Strip", note: "Ink wash, 2023" },
  { src: "/play/editorial-journal.png", w: 1200, h: 773, title: "Editorial Design Journal", note: "Self-initiated annual journal, 2025 edition" },
  { src: "/play/old-portfolio.jpg", w: 1200, h: 627, title: "An earlier portfolio", note: "Web design" },
  { src: "/play/stage.jpg", w: 944, h: 590, title: "On stage", note: "Hackathon" },
];
