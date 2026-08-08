/**
 * Client-safe postcard domain: the two catalogs a visitor picks from
 * (the picture on the front, the stamp on the back), the canvas
 * renderers for both sides, and Rebecca's preset cards. The server-only
 * storage half lives in postcards.ts.
 *
 * The front is never free-draw: it is one of the images below, so every
 * card stays on-palette.
 */

/**
 * The six pictures. All roughly square, so each is cover-cropped to the
 * card's 3:2; `focusY` biases that crop when the subject isn't centred
 * (0 keeps the top, 1 keeps the bottom).
 */
export const ART_OPTIONS = [
  { id: "water", label: "Water", src: "/postcards/water-sparkle.jpg", focusY: 0.5 },
  { id: "forest", label: "Forest", src: "/postcards/forest-light.jpg", focusY: 0.45 },
  { id: "tree", label: "Tree", src: "/postcards/tree-sun.jpg", focusY: 0.4 },
  { id: "lily", label: "Lily", src: "/postcards/lily-of-the-valley.jpg", focusY: 0.5 },
  { id: "aurora", label: "Aurora", src: "/postcards/aurora-walk.jpg", focusY: 0.72 },
  { id: "ripple", label: "Ripple", src: "/postcards/green-ripple.jpg", focusY: 0.5 },
] as const;

export const STAMP_OPTIONS = [
  { id: "bamboo", label: "Bamboo", src: "/stamps/bamboo.png" },
  { id: "alps", label: "Alps", src: "/stamps/alps.jpg" },
  { id: "sunrise", label: "Sunrise", src: "/stamps/sunrise.png" },
  { id: "lavender", label: "Lavender", src: "/stamps/lavender.png" },
  { id: "skis", label: "Skis", src: "/stamps/skis.png" },
  { id: "birdhouse", label: "Birdhouse", src: "/stamps/birdhouse.jpg" },
] as const;

export type ArtId = (typeof ART_OPTIONS)[number]["id"];
export type StampId = (typeof STAMP_OPTIONS)[number]["id"];

export type PostcardDesign = { art: ArtId; stamp: StampId };

export type PostcardData = {
  id: string;
  design: PostcardDesign;
  text: string;
  /** Empty string means anonymous. */
  name: string;
  /** Both optional; they fill the second and third address lines. */
  city?: string;
  role?: string;
};

/** What gets written on the three ruled lines, in order. */
export type PostcardSender = Pick<PostcardData, "name" | "city" | "role">;

export const DEFAULT_DESIGN: PostcardDesign = { art: "water", stamp: "bamboo" };

/**
 * Coerce whatever came out of storage into a design we can render.
 * Cards saved before the catalogs changed carry ids like "shore" that no
 * longer exist; those fall back rather than rendering a blank card.
 */
export function normalizeDesign(design: unknown): PostcardDesign {
  const d = (design ?? {}) as Partial<Record<"art" | "stamp", string>>;
  return {
    art: ART_OPTIONS.some((o) => o.id === d.art)
      ? (d.art as ArtId)
      : DEFAULT_DESIGN.art,
    stamp: STAMP_OPTIONS.some((o) => o.id === d.stamp)
      ? (d.stamp as StampId)
      : DEFAULT_DESIGN.stamp,
  };
}

export function artOption(id: ArtId) {
  return ART_OPTIONS.find((o) => o.id === id) ?? ART_OPTIONS[0];
}

export function artSrc(id: ArtId): string {
  return artOption(id).src;
}

export function stampSrc(id: StampId): string {
  return (STAMP_OPTIONS.find((o) => o.id === id) ?? STAMP_OPTIONS[0]).src;
}

/* ------------------------------------------------------------------ */
/*  Image loading                                                      */
/* ------------------------------------------------------------------ */

const imageCache = new Map<string, Promise<HTMLImageElement | null>>();

/** Loads once per src and shares the result; resolves null on failure. */
export function loadPostcardImage(
  src: string
): Promise<HTMLImageElement | null> {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const pending = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
  imageCache.set(src, pending);
  return pending;
}

/** Already-decoded image for a src, or null if it hasn't loaded yet. */
const ready = new Map<string, HTMLImageElement>();

export function readyImage(src: string): HTMLImageElement | null {
  return ready.get(src) ?? null;
}

export async function preloadPostcardImage(src: string) {
  const img = await loadPostcardImage(src);
  if (img) ready.set(src, img);
  return img;
}

/* ------------------------------------------------------------------ */
/*  Canvas rendering (shared by the 3D hero textures and the 2D        */
/*  composer preview)                                                   */
/* ------------------------------------------------------------------ */

const INK = "#2B2B33";
const CARD_PAPER = "#FCFAF3";

/**
 * Scale to fill the card and centre on the focal point, so a squarish
 * source crops to the card's 3:2 without distortion or bars.
 */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  w: number,
  h: number,
  focusY = 0.5
) {
  const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
  const dw = image.naturalWidth * scale;
  const dh = image.naturalHeight * scale;
  ctx.drawImage(image, (w - dw) / 2, (h - dh) * focusY, dw, dh);
}

/** Fits an image inside a box without cropping, centred. */
function drawContain(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  boxW: number,
  boxH: number
) {
  const scale = Math.min(boxW / image.naturalWidth, boxH / image.naturalHeight);
  const dw = image.naturalWidth * scale;
  const dh = image.naturalHeight * scale;
  ctx.drawImage(image, x + (boxW - dw) / 2, y + (boxH - dh) / 2, dw, dh);
}

/**
 * The picture side. `art` is the decoded image for design.art; when it
 * hasn't loaded yet the card renders as blank stock rather than
 * flashing a placeholder graphic.
 */
export function drawPostcardFront(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  design: PostcardDesign,
  art?: HTMLImageElement | null
) {
  ctx.fillStyle = CARD_PAPER;
  ctx.fillRect(0, 0, w, h);
  const option = artOption(design.art);
  const image = art ?? readyImage(option.src);
  if (image) drawCover(ctx, image, w, h, option.focusY);
}

/**
 * The writing side: message left, stamp and address lines right. The
 * stamp is the chosen image printed straight onto the stock, with no
 * box drawn around it.
 */
export function drawPostcardBack(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  text: string,
  sender: PostcardSender,
  stamp?: HTMLImageElement | null
) {
  ctx.fillStyle = CARD_PAPER;
  ctx.fillRect(0, 0, w, h);
  const u = Math.min(w, h) / 24;

  ctx.strokeStyle = "rgba(43,43,51,0.35)";
  ctx.lineWidth = 1.5;

  // divider
  ctx.beginPath();
  ctx.moveTo(w * 0.56, u * 2);
  ctx.lineTo(w * 0.56, h - u * 2);
  ctx.stroke();

  // stamp, top right. No outline: the stamp's own perforated edge is
  // the shape, and a box around it reads as a placeholder.
  if (stamp) drawContain(ctx, stamp, w - u * 6, u * 1.8, u * 4.2, u * 5);

  // Sender block on the right half: who, where, what they do. Each line
  // is optional and the rule stays whether or not it carries anything,
  // so an unfilled card still reads as a postcard. A blank first line
  // means anonymous, which is one of the choices rather than an
  // omission.
  const senderLines = [
    sender.name?.trim() || "anonymous",
    sender.city?.trim() ?? "",
    sender.role?.trim() ?? "",
  ];
  const lineX = w * 0.62;
  const lineRight = w - u * 2;

  for (let i = 0; i < 3; i++) {
    const y = h * 0.55 + i * u * 2.2;
    ctx.beginPath();
    ctx.moveTo(lineX, y);
    ctx.lineTo(lineRight, y);
    ctx.stroke();

    const value = senderLines[i];
    if (!value) continue;
    ctx.font = `italic ${u * 1.3}px Georgia, serif`;
    ctx.fillStyle = "rgba(43,43,51,0.7)";
    ctx.fillText(fit(ctx, value, lineRight - lineX), lineX, y - u * 0.5);
  }

  // message on the left half: wrap first, then center the block vertically
  ctx.fillStyle = INK;
  const size = u * 1.55;
  const lineHeight = size * 1.35;
  ctx.font = `italic ${size}px Georgia, serif`;
  const maxWidth = w * 0.56 - u * 4;
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const attempt = line ? `${line} ${word}` : word;
    if (ctx.measureText(attempt).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = attempt;
    }
  }
  if (line) lines.push(line);
  const maxLines = Math.floor((h - u * 4) / lineHeight);
  const shown = lines.slice(0, maxLines);
  let y = (h - shown.length * lineHeight) / 2 + size * 0.85;
  for (const l of shown) {
    ctx.fillText(l, u * 2, y);
    y += lineHeight;
  }

}

/** Truncate to fit a line, with an ellipsis if it has to be cut. */
function fit(ctx: CanvasRenderingContext2D, value: string, maxWidth: number) {
  if (ctx.measureText(value).width <= maxWidth) return value;
  let cut = value;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) {
    cut = cut.slice(0, -1);
  }
  return `${cut}…`;
}

/** Rebecca's own cards, always in the stream. */
export const PRESET_CARDS: PostcardData[] = [
  {
    id: "preset-1",
    design: { art: "water", stamp: "bamboo" },
    text: "Hi, I'm Rebecca. I make software feel a little less like software.",
    name: "Rebecca",
    city: "Toronto",
    role: "Designer",
  },
  {
    id: "preset-2",
    design: { art: "aurora", stamp: "skis" },
    text: "Design is the part you feel but never notice. That part takes the longest.",
    name: "Rebecca",
    city: "Ann Arbor",
    role: "Design engineer",
  },
  {
    id: "preset-3",
    design: { art: "forest", stamp: "sunrise" },
    text: "Most of my favorite work started as a question someone forgot to ask.",
    name: "Rebecca",
    city: "Toronto",
    role: "Product design intern",
  },
  {
    id: "preset-4",
    design: { art: "lily", stamp: "lavender" },
    text: "Wish you were here. Well, you are. Scroll down, I'll show you around.",
    name: "Rebecca",
    city: "Ann Arbor",
    role: "Student",
  },
  {
    id: "preset-5",
    design: { art: "ripple", stamp: "alps" },
    text: "Leave a postcard before you go. The next visitor will find it drifting by.",
    name: "Rebecca",
    city: "Toronto",
    role: "Designer",
  },
  {
    id: "preset-6",
    design: { art: "tree", stamp: "birdhouse" },
    text: "Everything here was built twice: once to learn it, once to mean it.",
    name: "Rebecca",
    city: "Ann Arbor",
    role: "Student",
  },
];
