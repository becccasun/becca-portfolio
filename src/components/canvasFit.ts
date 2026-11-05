// How far a turning canvas can reach past its slot, worked out from its size alone (no three.js), so the
// card can reserve that room before the 3D module loads and nothing shifts when it arrives.
// Shared by ArtCanvas.tsx (which sizes the overhang and the spacing) and canvas3d.ts (which frames the camera).

export const FOV = 26; // degrees, vertical
export const MAX_PITCH = 1.35; // about 77°
const FILL = 0.94; // at rest, the front face fills this much of the slot
const SIDE_ROOM = 0.06; // sideways reach allowed past the slot, as a share of its width (the column's padding)
const PAD = 0.015; // a little extra so antialiased edges never touch the boundary

export type Fit = { W: number; H: number; D: number; fill: number; x: number; y: number };

export function canvasSize(aspect: number, long: number) {
  return { W: aspect >= 1 ? long : long * aspect, H: aspect >= 1 ? long / aspect : long };
}

// Largest on-screen reach of any corner over every pose the canvas can take (any yaw, pitch up to
// MAX_PITCH), in slot widths (x) and slot heights (y) measured from the slot's centre.
function reach(W: number, H: number, D: number, aspect: number, fill: number) {
  const half = Math.tan(((FOV / 2) * Math.PI) / 180);
  const camZ = H / (2 * half * fill) + D / 2; // as in canvas3d's fit()
  let mx = 0, my = 0;
  const corners: [number, number, number][] = [];
  for (const a of [-1, 1]) for (const b of [-1, 1]) for (const c of [-1, 1]) corners.push([(a * W) / 2, (b * H) / 2, (c * D) / 2]);
  for (let i = 0; i < 96; i++) {
    const yaw = (i / 96) * Math.PI * 2, cy = Math.cos(yaw), sy = Math.sin(yaw);
    for (let j = 0; j <= 24; j++) {
      const p = -MAX_PITCH + (j / 24) * 2 * MAX_PITCH, cp = Math.cos(p), sp = Math.sin(p);
      for (const [x, y, z] of corners) {
        // three.js Euler XYZ: yaw about y first, then pitch about x
        const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
        const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
        const k = 1 / ((camZ - z2) * 2 * half);
        mx = Math.max(mx, Math.abs(x1) * k / aspect);
        my = Math.max(my, Math.abs(y2) * k);
      }
    }
  }
  return { x: mx, y: my };
}

// x, y: how far the drawing surface must overhang the slot on each side, as a share of the slot's width / height.
// fill drops below FILL only when a canvas would otherwise swing wider than the column allows.
export function canvasFit(aspect: number, long: number, depth: number): Fit {
  const { W, H } = canvasSize(aspect, long);
  let fill = FILL;
  let r = reach(W, H, depth, aspect, fill);
  for (let i = 0; i < 4 && r.x > 0.5 + SIDE_ROOM; i++) {
    fill *= (0.5 + SIDE_ROOM) / r.x;
    r = reach(W, H, depth, aspect, fill);
  }
  return { W, H, D: depth, fill, x: Math.max(0, r.x - 0.5) + PAD, y: Math.max(0, r.y - 0.5) + PAD };
}
