// A stretched painting canvas in three.js, built to the painting's own proportions (units are inches).
// Front: the painting on primed linen. Sides: primed linen wrapped over the stretcher bars.
// Back: the linen folds over pine stretcher bars and is stapled down; between the bars you see the
// raw underside of the canvas. Larger canvases get a cross brace.
// Loaded on demand by ArtCanvas.tsx, so three.js stays out of every other page's bundle.
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FOV, MAX_PITCH, canvasFit } from "./canvasFit";

export type CanvasSpec = { src: string; aspect: number; long: number; depth: number };
export type Pose = { yaw: number; pitch: number; fresh?: boolean }; // fresh: not placed yet, start it in the idle sway

const THREADS_PER_IN = 30;
const TILE_THREADS = 16; // threads per texture tile, each way
const TILES_PER_IN = THREADS_PER_IN / TILE_THREADS;
const WOOD_TILE_IN = 10;

// ── Procedural textures, shared by every canvas on the page ─────────────────
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dataTexture(data: Uint8Array, w: number, h: number, color: boolean) {
  const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  if (color) tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

type Shared = { normal: THREE.Texture; primed: THREE.Texture; raw: THREE.Texture; wood: THREE.Texture };
let shared: Shared | null = null;

function makeShared(): Shared {
  // Plain weave height field: warp threads run down, weft across, each passing over then under
  const N = 256, cell = N / TILE_THREADS, r = rng(11);
  const thickX = Array.from({ length: TILE_THREADS }, () => 0.8 + 0.4 * r());
  const thickY = Array.from({ length: TILE_THREADS }, () => 0.8 + 0.4 * r());
  const h = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = Math.floor(x / cell), j = Math.floor(y / cell);
    const fx = (x % cell) / cell, fy = (y % cell) / cell;
    const warp = Math.sin(Math.PI * fx) ** 0.7 * thickX[i];
    const weft = Math.sin(Math.PI * fy) ** 0.7 * thickY[j];
    const warpOver = (i + j) % 2 === 0;
    const v = warpOver
      ? Math.max(warp * (0.55 + 0.45 * Math.sin(Math.PI * fy)), weft * 0.45)
      : Math.max(weft * (0.55 + 0.45 * Math.sin(Math.PI * fx)), warp * 0.45);
    h[y * N + x] = v + (r() - 0.5) * 0.08;
  }
  const at = (x: number, y: number) => h[((y + N) % N) * N + ((x + N) % N)];
  const normal = new Uint8Array(N * N * 4), primed = new Uint8Array(N * N * 4), raw = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const k = (y * N + x) * 4, s = 2.2;
    const dx = (at(x + 1, y) - at(x - 1, y)) * s, dy = (at(x, y + 1) - at(x, y - 1)) * s;
    const len = Math.hypot(dx, dy, 1);
    normal.set([(-dx / len * 0.5 + 0.5) * 255, (dy / len * 0.5 + 0.5) * 255, (1 / len * 0.5 + 0.5) * 255, 255], k);
    const v = Math.min(1, Math.max(0, at(x, y)));
    const p = 0.9 + 0.1 * v, q = 0.8 + 0.2 * v;
    primed.set([239 * p, 235 * p, 226 * p, 255], k);
    raw.set([214 * q, 197 * q, 164 * q, 255], k);
  }

  // Pine: soft late-wood lines along the length with a slow wobble and a little speckle
  const WW = 512, WH = 128, wr = rng(5);
  const wood = new Uint8Array(WW * WH * 4);
  const wobble = Array.from({ length: 8 }, () => wr() * Math.PI * 2);
  const fibre = Array.from({ length: WH }, () => (wr() - 0.5) * 0.06);
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) {
    const u = (x / WW) * Math.PI * 2;
    const off = 1.6 * Math.sin(u + wobble[0]) + 0.9 * Math.sin(2 * u + wobble[1]) + 0.4 * Math.sin(5 * u + wobble[2]);
    const ring = 0.5 + 0.5 * Math.sin(((y + off) / WH) * Math.PI * 2 * 9 + 0.35 * Math.sin(3 * u + wobble[3]));
    const line = ring ** 5;
    const n = (wr() - 0.5) * 0.035 + fibre[y];
    const f = 1 - 0.14 * line + n;
    wood.set([226 * f, 193 * f, 146 * f, 255], (y * WW + x) * 4);
  }

  return {
    normal: dataTexture(normal, N, N, false),
    primed: dataTexture(primed, N, N, true),
    raw: dataTexture(raw, N, N, true),
    wood: dataTexture(wood, WW, WH, true),
  };
}

// Multiply a geometry's UVs so a repeating texture keeps a physical scale. `to` writes them into another channel.
function scaleUV(g: THREE.BufferGeometry, sx: number, sy: number, to = "uv") {
  const src = g.getAttribute("uv") as THREE.BufferAttribute;
  const out = new Float32Array(src.count * 2);
  for (let i = 0; i < src.count; i++) { out[i * 2] = src.getX(i) * sx; out[i * 2 + 1] = src.getY(i) * sy; }
  g.setAttribute(to, new THREE.BufferAttribute(out, 2));
  return g;
}

// ── The model ────────────────────────────────────────────────────────────────
function buildCanvas(spec: CanvasSpec, painting: THREE.Texture, tex: Shared) {
  const { aspect, long, depth: D } = spec;
  const W = aspect >= 1 ? long : long * aspect;
  const H = aspect >= 1 ? long / aspect : long;
  const t = 0.03; // canvas thickness
  const bar = long <= 10 ? 0.75 : 1.5; // stretcher bar face width
  const fold = bar * 0.6; // how far the linen folds onto the back of the bars
  const g = new THREE.Group();
  const T = TILES_PER_IN;

  const linen = (map: THREE.Texture, rough = 0.92) =>
    new THREE.MeshStandardMaterial({ map, normalMap: tex.normal, normalScale: new THREE.Vector2(0.55, 0.55), roughness: rough });
  const primed = linen(tex.primed);
  const raw = linen(tex.raw, 0.97);
  const wood = new THREE.MeshStandardMaterial({ map: tex.wood, roughness: 0.78 });
  const steel = new THREE.MeshStandardMaterial({ color: 0xbfc2c6, metalness: 1, roughness: 0.32 });

  // Front: the painting, with the weave catching light through a second UV channel
  const frontNormal = tex.normal.clone();
  frontNormal.channel = 1;
  const front = new THREE.Mesh(
    scaleUV(new THREE.PlaneGeometry(W, H), W * T, H * T, "uv1"),
    new THREE.MeshStandardMaterial({ map: painting, normalMap: frontNormal, normalScale: new THREE.Vector2(0.28, 0.28), roughness: 0.62 }),
  );
  front.position.z = D / 2;
  g.add(front);

  // Sides
  const side = (w: number, h: number) => new THREE.Mesh(scaleUV(new THREE.PlaneGeometry(w, h), w * T, h * T), primed);
  const top = side(W, D); top.rotation.x = -Math.PI / 2; top.position.y = H / 2; g.add(top);
  const bottom = side(W, D); bottom.rotation.x = Math.PI / 2; bottom.position.y = -H / 2; g.add(bottom);
  const left = side(D, H); left.rotation.y = -Math.PI / 2; left.position.x = -W / 2; g.add(left);
  const right = side(D, H); right.rotation.y = Math.PI / 2; right.position.x = W / 2; g.add(right);

  // Back: linen folded over the bars, as a frame with an opening
  const ring = new THREE.Shape([new THREE.Vector2(-W / 2, -H / 2), new THREE.Vector2(W / 2, -H / 2), new THREE.Vector2(W / 2, H / 2), new THREE.Vector2(-W / 2, H / 2)]);
  ring.holes.push(new THREE.Path([
    new THREE.Vector2(-W / 2 + fold, -H / 2 + fold), new THREE.Vector2(-W / 2 + fold, H / 2 - fold),
    new THREE.Vector2(W / 2 - fold, H / 2 - fold), new THREE.Vector2(W / 2 - fold, -H / 2 + fold),
  ]));
  // The flaps lie on the bars' back faces. Their own material is pulled toward the camera in the depth
  // test, on top of a real gap, so the wood under them can never flicker through as the canvas turns.
  const flapLinen = linen(tex.primed);
  flapLinen.polygonOffset = true;
  flapLinen.polygonOffsetFactor = -2;
  flapLinen.polygonOffsetUnits = -4;
  const flaps = new THREE.Mesh(scaleUV(new THREE.ShapeGeometry(ring), T, T), flapLinen);
  flaps.rotation.y = Math.PI;
  flaps.position.z = -D / 2 - Math.max(0.006, long * 0.0006);
  g.add(flaps);

  // The raw underside of the canvas, seen between the bars
  const under = new THREE.Mesh(scaleUV(new THREE.PlaneGeometry(W - bar * 2, H - bar * 2), (W - bar * 2) * T, (H - bar * 2) * T), raw);
  under.rotation.y = Math.PI;
  under.position.z = D / 2 - t;
  g.add(under);

  // Stretcher bars: built along x, then turned for the uprights so the grain runs down their length
  const barDepth = D - t;
  const barZ = -t / 2;
  const addBar = (len: number, x: number, y: number, upright: boolean) => {
    const geo = scaleUV(new THREE.BoxGeometry(len, bar - 0.012, barDepth), len / WOOD_TILE_IN, 0.35);
    const m = new THREE.Mesh(geo, wood);
    if (upright) m.rotation.z = Math.PI / 2;
    m.position.set(x, y, barZ);
    g.add(m);
  };
  // Inset a hair from the sides so the bars' outer faces never fight the linen for the same plane
  const e = 0.012;
  addBar(W - e * 2, 0, H / 2 - bar / 2 - e, false);
  addBar(W - e * 2, 0, -H / 2 + bar / 2 + e, false);
  addBar(H - bar * 2 - e * 2, -W / 2 + bar / 2 + e, 0, true);
  addBar(H - bar * 2 - e * 2, W / 2 - bar / 2 - e, 0, true);
  if (long >= 16) {
    if (H >= W) addBar(W - bar * 2, 0, 0, false);
    else addBar(H - bar * 2, 0, 0, true);
  }

  // Staples along the folded linen, every couple of inches
  const staple = new THREE.BoxGeometry(0.42, 0.05, 0.03);
  const z = -D / 2 - Math.max(0.006, long * 0.0006) - 0.016;
  const run = (len: number, place: (s: number) => [number, number, boolean]) => {
    const n = Math.max(2, Math.round(len / 2.2));
    for (let i = 0; i < n; i++) {
      const s = -len / 2 + (len * (i + 0.5)) / n;
      const [x, y, upright] = place(s);
      const m = new THREE.Mesh(staple, steel);
      if (upright) m.rotation.z = Math.PI / 2;
      m.position.set(x, y, z);
      g.add(m);
    }
  };
  const c = fold / 2;
  run(W - bar * 2, (s) => [s, H / 2 - c, false]);
  run(W - bar * 2, (s) => [s, -H / 2 + c, false]);
  run(H - bar * 2, (s) => [-W / 2 + c, s, true]);
  run(H - bar * 2, (s) => [W / 2 - c, s, true]);

  return { group: g, W, H, D };
}

// ── Mount: renderer, lights, drag to turn ───────────────────────────────────
export function mountCanvas(host: HTMLElement, spec: CanvasSpec, pose: Pose, onReady: () => void) {
  shared ??= makeShared();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.75;
  const key = new THREE.DirectionalLight(0xfff6ea, 1.5);
  key.position.set(-4, 6, 9);
  scene.add(key, new THREE.HemisphereLight(0xffffff, 0xd8d2c8, 0.35));

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 500);
  const framing = canvasFit(spec.aspect, spec.long, spec.depth);
  let model: ReturnType<typeof buildCanvas> | null = null;
  let disposed = false;

  const painting = new THREE.TextureLoader().load(spec.src, () => {
    if (disposed) return;
    painting.colorSpace = THREE.SRGBColorSpace;
    painting.anisotropy = renderer.capabilities.getMaxAnisotropy();
    model = buildCanvas(spec, painting, shared!);
    scene.add(model.group);
    fit();
    render();
    onReady();
  });

  // The drawing surface overhangs the slot (see ArtCanvas.module.css), so a turning canvas can swing past
  // the slot's edges instead of being cut off. At rest the front face fills the slot itself.
  function fit() {
    const cv = renderer.domElement;
    const rw = cv.clientWidth, rh = cv.clientHeight, sw = host.clientWidth, sh = host.clientHeight;
    if (!rw || !rh || !sw || !sh) return;
    renderer.setSize(rw, rh, false);
    camera.aspect = rw / rh;
    camera.updateProjectionMatrix();
    if (!model) return;
    const half = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const fill = framing.fill;
    const dW = (model.W * rw) / (2 * half * camera.aspect * sw * fill);
    const dH = (model.H * rh) / (2 * half * sh * fill);
    const camZ = Math.max(dW, dH) + model.D / 2;
    camera.position.set(0, 0, camZ);
    camera.lookAt(0, 0, 0);
    // Keep the depth range just around the canvas: with near at 0.1 the depth buffer had too little
    // precision at a big canvas's distance, and layers a hair apart (linen over wood) took turns showing.
    const R = Math.hypot(model.W, model.H, model.D) / 2 + 0.5;
    camera.near = Math.max(0.1, camZ - R);
    camera.far = camZ + R;
    camera.updateProjectionMatrix();
  }

  function render() {
    if (model) model.group.rotation.set(pose.pitch, pose.yaw, 0);
    renderer.render(scene, camera);
  }

  // Left alone, the canvas sways gently around its front: a slow pan left and right with a little tilt,
  // never far enough to show the back. A drag can turn it all the way round (a flick carries on and slows
  // down); a moment after letting go a spring pulls it back to the front, the short way round.
  // Scrolling is left alone.
  const SWAY = 0.32; // rad, about 18° either side of front: the sides show, the back never does
  const SWAY_HZ = 1 / 7; // one full sway every 7 seconds
  const TILT = 0.05; // rad of up/down nod on top of the resting tilt
  const REST_PITCH = 0.1;
  const HOLD_MS = 1200; // how long a turned canvas stays where it was left before springing back
  const K = 4, ZETA = 0.8; // spring stiffness (rad/s) and damping: a soft return with a hint of overshoot
  const TAU = Math.PI * 2;
  // each canvas sways on its own phase so the column isn't moving in lockstep
  const phase = ([...spec.src].reduce((a, c) => a + c.charCodeAt(0), 0) % 97) / 97 * TAU;
  const target = (now: number) => {
    if (reduced) return { yaw: 0, pitch: REST_PITCH };
    const a = (now / 1000) * SWAY_HZ * TAU + phase;
    return { yaw: SWAY * Math.sin(a), pitch: REST_PITCH + TILT * Math.sin(a * 0.6 + 1.3) };
  };
  let raf = 0, dragging = false, last = { x: 0, y: 0, t: 0 }, vel = 0, pvel = 0;
  let lastFrame = 0, released = -Infinity, onScreen = false, settled = false;
  // A fresh canvas starts already in its sway, painting side out
  if (pose.fresh) { Object.assign(pose, target(performance.now())); pose.fresh = false; }
  const loop = (now: number) => {
    raf = 0;
    const dt = Math.min(0.05, lastFrame ? (now - lastFrame) / 1000 : 0);
    lastFrame = now;
    settled = false;
    if (!dragging) {
      if (now - released < HOLD_MS) {
        vel *= Math.exp(-dt * 2.5);
        pvel = 0;
      } else {
        const g = target(now);
        // after a spin, head for the nearest copy of the front rather than unwinding every turn
        // (dropping whole turns from the angle changes nothing on screen)
        pose.yaw -= TAU * Math.round((pose.yaw - g.yaw) / TAU);
        vel += (K * K * (g.yaw - pose.yaw) - 2 * ZETA * K * vel) * dt;
        pvel += (K * K * (g.pitch - pose.pitch) - 2 * ZETA * K * pvel) * dt;
        settled = reduced && Math.abs(g.yaw - pose.yaw) < 0.001 && Math.abs(vel) < 0.001 && Math.abs(g.pitch - pose.pitch) < 0.001;
      }
      pose.yaw += vel * dt;
      pose.pitch += pvel * dt;
    }
    render();
    if (onScreen && !settled) raf = requestAnimationFrame(loop);
    else lastFrame = 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const speed = () => (Math.PI * 2) / Math.max(320, host.clientWidth * 1.6);

  const vis = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) kick(); });
  vis.observe(host);

  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    dragging = true; vel = 0; pvel = 0;
    last = { x: e.clientX, y: e.clientY, t: performance.now() };
    host.setPointerCapture(e.pointerId);
    host.dataset.dragging = "";
    kick();
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const k = speed(), dx = (e.clientX - last.x) * k, dy = (e.clientY - last.y) * k;
    pose.yaw += dx;
    pose.pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pose.pitch + dy));
    const now = performance.now(), dt = Math.max(8, now - last.t) / 1000;
    vel = dx / dt;
    last = { x: e.clientX, y: e.clientY, t: now };
  };
  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    released = performance.now();
    delete host.dataset.dragging;
    if (released - last.t > 80) vel = 0;
    kick();
  };
  const onKey = (e: KeyboardEvent) => {
    const step = Math.PI / 12;
    if (e.key === "ArrowLeft") pose.yaw -= step;
    else if (e.key === "ArrowRight") pose.yaw += step;
    else if (e.key === "ArrowUp") pose.pitch = Math.max(-MAX_PITCH, pose.pitch - step);
    else if (e.key === "ArrowDown") pose.pitch = Math.min(MAX_PITCH, pose.pitch + step);
    else return;
    e.preventDefault();
    released = performance.now();
    vel = 0;
    kick();
  };
  host.addEventListener("pointerdown", onDown);
  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerup", onUp);
  host.addEventListener("pointercancel", onUp);
  host.addEventListener("keydown", onKey);

  const ro = new ResizeObserver(() => { fit(); render(); });
  ro.observe(host);
  ro.observe(renderer.domElement);

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    vis.disconnect();
    host.removeEventListener("pointerdown", onDown);
    host.removeEventListener("pointermove", onMove);
    host.removeEventListener("pointerup", onUp);
    host.removeEventListener("pointercancel", onUp);
    host.removeEventListener("keydown", onKey);
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      }
    });
    painting.dispose();
    env.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
