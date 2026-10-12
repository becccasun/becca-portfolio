import { useId } from "react";
import type { GeneratedArt, StampData } from "@/content";

// One postage stamp, drawn entirely in SVG so it stays sharp from the row (~130px)
// to the open state (~290px). Everything is in a 100 × 125 viewBox:
//   paper  — cream, perforated by a mask of circular bites along every edge
//   art    — inset panel of heavily blurred colour shapes under coarse film grain
//   creases — faint light/dark facets over paper and art, like a folded stamp

export const STAMP_W = 100;
export const STAMP_H = 125;

// 12 teeth across, 15 down: the same pitch on both sides, with a bite on every corner.
const PITCH = STAMP_W / 12;
const BITE = 3;
const ART = { x: 8, y: 8, w: 84, h: 106.5, r: 3.6 };

const bites = (() => {
  const out: [number, number][] = [];
  for (let i = 0; i <= 12; i++) out.push([i * PITCH, 0], [i * PITCH, STAMP_H]);
  for (let j = 1; j < 15; j++) out.push([0, j * PITCH], [STAMP_W, j * PITCH]);
  return out.map(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
})();

// The same perforated outline as a CSS mask-image, for wrappers that need to clip to it
// (the TiltCard's dent and rim, and its drop-shadow).
export const PERFORATION_MASK = (() => {
  const holes = bites.map(([x, y]) => `<circle cx='${x}' cy='${y}' r='${BITE}' fill='black'/>`).join("");
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${STAMP_W} ${STAMP_H}' preserveAspectRatio='none'>` +
    `<defs><mask id='m'><rect width='${STAMP_W}' height='${STAMP_H}' fill='white'/>${holes}</mask></defs>` +
    `<rect width='${STAMP_W}' height='${STAMP_H}' mask='url(#m)'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();

// Two fold patterns, alternated across the row so neighbours don't crease identically.
const CREASES = [
  [
    { d: "M0 0 L58 0 L34 125 L0 125 Z", fill: "#fff", o: 0.035 },
    { d: "M58 0 L100 0 L100 52 Z", fill: "#000", o: 0.02 },
    { d: "M34 125 L100 52 L100 125 Z", fill: "#000", o: 0.015 },
  ],
  [
    { d: "M0 38 L100 0 L100 0 L0 0 Z", fill: "#000", o: 0.018 },
    { d: "M0 38 L100 0 L100 84 L22 125 L0 125 Z", fill: "#fff", o: 0.03 },
    { d: "M22 125 L100 84 L100 125 Z", fill: "#000", o: 0.018 },
  ],
];

// ── the paper ─────────────────────────────────────────────
// Rebecca is trying the perforated border in the site's dark grey (--button, the same
// as the chat mascot) instead of cream. Set PAPER to "cream" to go back.
const PAPER: "cream" | "charcoal" = "cream";
const PAPERS = {
  cream: {
    fill: "#f2efe7",
    // warm, darker specks on light paper
    grain: "0 0 0 0 0.35  0 0 0 0 0.32  0 0 0 0 0.26  0 0 0 0.2 -0.05",
  },
  charcoal: {
    fill: "var(--button)",
    // faint light specks on dark paper, so it still reads as paper rather than a flat fill
    grain: "0 0 0 0 0.92  0 0 0 0 0.92  0 0 0 0 0.9  0 0 0 0.13 -0.035",
  },
};

export default function Stamp({ data, index }: { data: StampData; index: number }) {
  const id = useId().replace(/:/g, "");
  // A painting already carries its own canvas texture, so it gets far less added grain
  // than the generated gradients, which are mostly noise up close.
  const painting = "image" in data.art ? data.art : null;
  const gen = painting ? null : (data.art as GeneratedArt);

  return (
    <svg viewBox={`0 0 ${STAMP_W} ${STAMP_H}`} width="100%" height="100%" aria-hidden style={{ display: "block", overflow: "visible" }}>
      <defs>
        <mask id={`${id}-perf`} maskUnits="userSpaceOnUse" x="0" y="0" width={STAMP_W} height={STAMP_H}>
          <rect width={STAMP_W} height={STAMP_H} fill="#fff" />
          {bites.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={BITE} fill="#000" />)}
        </mask>
        <clipPath id={`${id}-art`}>
          <rect x={ART.x} y={ART.y} width={ART.w} height={ART.h} rx={ART.r} />
        </clipPath>
        {gen && (
          <>
            <linearGradient id={`${id}-ground`} x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0" stopColor={gen.from} />
              <stop offset="1" stopColor={gen.to} />
            </linearGradient>
            <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={gen.blur} />
            </filter>
          </>
        )}
        {/* Coarse monochrome grain: the art is mostly noise up close */}
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.35" numOctaves="2" seed={index + 3} stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.6 -0.45" />
        </filter>
        <filter id={`${id}-paper`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed={index + 11} stitchTiles="stitch" />
          <feColorMatrix type="matrix" values={PAPERS[PAPER].grain} />
        </filter>
      </defs>

      <g mask={`url(#${id}-perf)`}>
        {/* paper */}
        <rect width={STAMP_W} height={STAMP_H} style={{ fill: PAPERS[PAPER].fill }} />
        <rect width={STAMP_W} height={STAMP_H} filter={`url(#${id}-paper)`} />

        {/* art */}
        <g clipPath={`url(#${id}-art)`}>
          {painting ? (
            <image
              href={painting.image}
              x={ART.x}
              y={ART.y}
              width={ART.w}
              height={ART.h}
              preserveAspectRatio={`${painting.align ?? "xMidYMid"} slice`}
            />
          ) : (
            <>
          <rect x={ART.x} y={ART.y} width={ART.w} height={ART.h} fill={`url(#${id}-ground)`} />
          <g filter={`url(#${id}-soft)`}>
            {gen!.shapes.map((sh, i) => (
              <ellipse
                key={i}
                cx={sh.cx}
                cy={sh.cy}
                rx={sh.rx}
                ry={sh.ry}
                fill={sh.fill}
                opacity={sh.o ?? 1}
                transform={sh.rot ? `rotate(${sh.rot} ${sh.cx} ${sh.cy})` : undefined}
              />
            ))}
          </g>
            </>
          )}
          <rect x={ART.x} y={ART.y} width={ART.w} height={ART.h} filter={`url(#${id}-grain)`} style={{ mixBlendMode: "overlay" }} opacity={painting ? 0.18 : 0.55} />
          {/* inner edge: the art sits slightly into the paper */}
          <rect x={ART.x + 0.15} y={ART.y + 0.15} width={ART.w - 0.3} height={ART.h - 0.3} rx={ART.r} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.3" />
        </g>

        {/* creases over everything */}
        {CREASES[index % CREASES.length].map((c, i) => (
          <path key={i} d={c.d} fill={c.fill} opacity={c.o} />
        ))}

        {/* no printed name or date: the stamps are just the paintings. (The name and date
            stay in the stamp data; StampRow reads them out as each stamp's label.) */}
      </g>
    </svg>
  );
}
