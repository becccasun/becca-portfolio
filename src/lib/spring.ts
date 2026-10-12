// Small damped spring, integrated per frame (semi-implicit Euler, dt in seconds).
// Shared by anything that settles: one value, its velocity, and where it is heading.

export type Spring = { x: number; v: number; t: number };

export const spring = (t = 0): Spring => ({ x: t, v: 0, t });

export const step = (s: Spring, k: number, c: number, dt: number) => {
  s.v += (k * (s.t - s.x) - c * s.v) * dt;
  s.x += s.v * dt;
};

export const settled = (s: Spring, eps = 0.01) => Math.abs(s.t - s.x) < eps && Math.abs(s.v) < eps;

/** Jump straight to the target (reduced motion, or teleporting between coordinate spaces). */
export const snap = (s: Spring) => {
  s.x = s.t;
  s.v = 0;
};
