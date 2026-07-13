/**
 * Client-safe postcard domain: the component catalogs a visitor builds
 * a card front from (background, foreground, decoration), the canvas
 * renderers for both sides, and Rebecca's preset cards. The server-only
 * storage half lives in postcards.ts.
 *
 * The front is never free-draw: it is always bg + fg + deco from these
 * catalogs, so every combination stays on-palette.
 */

export const BG_OPTIONS = [
  { id: "shore", label: "Shore" },
  { id: "meadow", label: "Meadow" },
  { id: "dusk", label: "Dusk" },
  { id: "paper", label: "Paper" },
] as const;

export const FG_OPTIONS = [
  { id: "bloom", label: "Bloom" },
  { id: "tide", label: "Tide" },
  { id: "peaks", label: "Peaks" },
  { id: "orbit", label: "Orbit" },
] as const;

export const DECO_OPTIONS = [
  { id: "stamp", label: "Stamp" },
  { id: "airmail", label: "Airmail" },
  { id: "postmark", label: "Postmark" },
  { id: "frame", label: "Frame" },
] as const;

export type BgId = (typeof BG_OPTIONS)[number]["id"];
export type FgId = (typeof FG_OPTIONS)[number]["id"];
export type DecoId = (typeof DECO_OPTIONS)[number]["id"];

export type PostcardDesign = { bg: BgId; fg: FgId; deco: DecoId };

export type PostcardData = {
  id: string;
  design: PostcardDesign;
  text: string;
  /** Empty string means anonymous. */
  name: string;
};

/** Rebecca's own cards, always in the stream. */
export const PRESET_CARDS: PostcardData[] = [
  {
    id: "preset-1",
    design: { bg: "shore", fg: "bloom", deco: "stamp" },
    text: "Hi, I'm Rebecca. I make software feel a little less like software.",
    name: "Rebecca",
  },
  {
    id: "preset-2",
    design: { bg: "dusk", fg: "orbit", deco: "airmail" },
    text: "Design is the part you feel but never notice. That part takes the longest.",
    name: "Rebecca",
  },
  {
    id: "preset-3",
    design: { bg: "meadow", fg: "tide", deco: "postmark" },
    text: "Most of my favorite work started as a question someone forgot to ask.",
    name: "Rebecca",
  },
  {
    id: "preset-4",
    design: { bg: "paper", fg: "peaks", deco: "frame" },
    text: "Wish you were here. Well, you are. Scroll down, I'll show you around.",
    name: "Rebecca",
  },
  {
    id: "preset-5",
    design: { bg: "shore", fg: "tide", deco: "airmail" },
    text: "Leave a postcard before you go. The next visitor will find it drifting by.",
    name: "Rebecca",
  },
];

/* ------------------------------------------------------------------ */
/*  Canvas rendering (shared by the 3D hero textures and the 2D        */
/*  composer preview)                                                   */
/* ------------------------------------------------------------------ */

const INK = "#2B2B33";

export function drawPostcardFront(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  design: PostcardDesign
) {
  drawBackground(ctx, w, h, design.bg);
  drawForeground(ctx, w, h, design.fg);
  drawDecoration(ctx, w, h, design.deco);
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bg: BgId
) {
  let g: CanvasGradient;
  switch (bg) {
    case "shore":
      g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#E9F0F8");
      g.addColorStop(1, "#FAF3E3");
      break;
    case "meadow":
      g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#EAF2EC");
      g.addColorStop(1, "#F7F9F0");
      break;
    case "dusk":
      g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#F0ECF8");
      g.addColorStop(1, "#F6ECEF");
      break;
    case "paper":
      g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#FAF6EA");
      g.addColorStop(1, "#F4EEDC");
      break;
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  if (bg === "paper") {
    ctx.fillStyle = "rgba(43,43,51,0.05)";
    for (let i = 0; i < 140; i++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
    }
  }
}

function drawForeground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  fg: FgId
) {
  const cx = w / 2;
  const cy = h / 2;
  const u = Math.min(w, h) / 10; // motif unit
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineWidth = u * 0.16;
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.85;

  if (fg === "bloom") {
    // six petals around a core, on a curved stem
    ctx.beginPath();
    ctx.moveTo(cx, cy + u * 3.6);
    ctx.quadraticCurveTo(cx - u * 0.8, cy + u * 2, cx, cy + u * 0.9);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(
        cx + Math.cos(a) * u * 1.1,
        cy - u * 0.4 + Math.sin(a) * u * 1.1,
        u * 0.62,
        u * 0.38,
        a,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx, cy - u * 0.4, u * 0.42, 0, Math.PI * 2);
    ctx.fill();
  }

  if (fg === "tide") {
    for (let row = 0; row < 3; row++) {
      const y = cy - u + row * u * 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - u * 3.4, y);
      for (let k = 0; k < 4; k++) {
        const x0 = cx - u * 3.4 + k * u * 1.7;
        ctx.quadraticCurveTo(x0 + u * 0.45, y - u * 0.9, x0 + u * 0.85, y);
        ctx.quadraticCurveTo(x0 + u * 1.25, y + u * 0.55, x0 + u * 1.7, y);
      }
      ctx.stroke();
    }
  }

  if (fg === "peaks") {
    ctx.beginPath();
    ctx.moveTo(cx - u * 3.4, cy + u * 2);
    ctx.lineTo(cx - u * 1.2, cy - u * 1.6);
    ctx.lineTo(cx + u * 0.6, cy + u * 2);
    ctx.moveTo(cx - u * 0.4, cy + u * 2);
    ctx.lineTo(cx + u * 1.8, cy - u * 0.6);
    ctx.lineTo(cx + u * 3.6, cy + u * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + u * 2.4, cy - u * 2.2, u * 0.6, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (fg === "orbit") {
    ctx.beginPath();
    ctx.arc(cx, cy, u * 2.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy, u * 3.2, u * 1.1, -0.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + u * 2.7, cy - u * 1.5, u * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawDecoration(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  deco: DecoId
) {
  const u = Math.min(w, h) / 24;
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.globalAlpha = 0.65;
  ctx.lineWidth = u * 0.28;

  if (deco === "stamp") {
    const sw = u * 4.4;
    const sh = u * 5.4;
    const x = w - sw - u * 1.6;
    const y = u * 1.6;
    ctx.strokeRect(x, y, sw, sh);
    ctx.strokeRect(x + u * 0.7, y + u * 0.7, sw - u * 1.4, sh - u * 1.4);
    // perforation dots
    ctx.fillStyle = INK;
    for (let i = 0; i <= 6; i++) {
      ctx.fillRect(x + (i / 6) * sw - 1, y - u * 0.5, 2, 2);
      ctx.fillRect(x + (i / 6) * sw - 1, y + sh + u * 0.35, 2, 2);
    }
  }

  if (deco === "airmail") {
    // classic diagonal striped border, top and bottom
    const bh = u * 1.4;
    for (const yy of [0, h - bh]) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, yy, w, bh);
      ctx.clip();
      for (let x = -bh; x < w + bh; x += u * 1.8) {
        ctx.beginPath();
        ctx.moveTo(x, yy + bh);
        ctx.lineTo(x + bh, yy);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  if (deco === "postmark") {
    const x = w - u * 6;
    const y = u * 4;
    ctx.beginPath();
    ctx.arc(x, y, u * 2.2, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const yy = y - u * 0.8 + i * u * 0.8;
      ctx.beginPath();
      ctx.moveTo(x + u * 2.8, yy);
      ctx.quadraticCurveTo(x + u * 4.2, yy - u * 0.4, x + u * 5.6, yy);
      ctx.stroke();
    }
  }

  if (deco === "frame") {
    ctx.setLineDash([u * 0.9, u * 0.7]);
    ctx.strokeRect(u * 1.4, u * 1.4, w - u * 2.8, h - u * 2.8);
  }

  ctx.restore();
}

export function drawPostcardBack(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  text: string,
  name: string
) {
  ctx.fillStyle = "#FCFAF3";
  ctx.fillRect(0, 0, w, h);
  const u = Math.min(w, h) / 24;

  ctx.strokeStyle = "rgba(43,43,51,0.35)";
  ctx.lineWidth = 1.5;

  // divider
  ctx.beginPath();
  ctx.moveTo(w * 0.56, u * 2);
  ctx.lineTo(w * 0.56, h - u * 2);
  ctx.stroke();

  // stamp box + address lines on the right half
  ctx.strokeRect(w - u * 6, u * 1.8, u * 4.2, u * 5);
  for (let i = 0; i < 3; i++) {
    const y = h * 0.55 + i * u * 2.2;
    ctx.beginPath();
    ctx.moveTo(w * 0.62, y);
    ctx.lineTo(w - u * 2, y);
    ctx.stroke();
  }

  // message, wrapped, on the left half
  ctx.fillStyle = INK;
  const size = u * 1.55;
  ctx.font = `italic ${size}px Georgia, serif`;
  const maxWidth = w * 0.56 - u * 4;
  const words = text.split(/\s+/);
  let line = "";
  let y = u * 3.4;
  for (const word of words) {
    const attempt = line ? `${line} ${word}` : word;
    if (ctx.measureText(attempt).width > maxWidth && line) {
      ctx.fillText(line, u * 2, y);
      line = word;
      y += size * 1.35;
      if (y > h - u * 5) break;
    } else {
      line = attempt;
    }
  }
  if (y <= h - u * 5) ctx.fillText(line, u * 2, y);

  ctx.font = `${u * 1.2}px Georgia, serif`;
  ctx.fillStyle = "rgba(43,43,51,0.65)";
  ctx.fillText(`— ${name || "anonymous"}`, u * 2, h - u * 2.6);
}
