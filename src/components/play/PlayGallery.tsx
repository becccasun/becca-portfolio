"use client";

import { useEffect, useRef, useState } from "react";
import { PLAY_ITEMS, ROOM, type PlayItem } from "@/lib/play";
import styles from "./PlayGallery.module.css";

const WALLS: (0 | 1 | 2 | 3)[] = [0, 1, 2, 3];

// Mixed hanging: pieces are dealt onto the walls' layout slots in a
// deterministic shuffle (stable across server and client renders)
// instead of grouped by category.
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

// Pieces that opt out take their slot with them, so the wall closes up
// instead of leaving a hole where they used to hang.
const HANGING = PLAY_ITEMS.filter((i) => i.hangs !== false);
const SLOTS = HANGING.map(({ wall, x, y, w }) => ({ wall, x, y, w }));
const HUNG = [...HANGING]
  .sort((a, b) => hash(a.id + "salt") - hash(b.id + "salt"))
  .map((item, i) => ({ ...item, ...SLOTS[i] }));
const DEG = 180 / Math.PI;
const PITCH_LIMIT = 32;
/** Perspective distance at the width the room was composed for. */
const PERSP = 760;
const PERSP_AT = 1440;

/**
 * Objects project at persp / distance, so a fixed perspective on a narrow
 * window shows the same slice of wall blown up until a single frame fills
 * the screen. Scaling it with the viewport keeps roughly the same amount
 * of room in view at any size.
 */
function perspFor(width: number) {
  return PERSP * Math.min(1, Math.max(0.42, width / PERSP_AT));
}
/** How far the camera pushes in when a single piece is selected. */
const FOCUS_ZOOM = 2.1;

const CATEGORY_LABEL = {
  crafts: "Arts & crafts",
  digital: "Digital exploration",
  photo: "Photography & video",
} as const;

/**
 * Walls sit at yaw = -wall * 90, so turning right (yaw +90) from wall 0
 * lands on wall 3 — the wall physically on your right. Yaw accumulates
 * rather than wrapping, so the camera turns the way the key implies
 * instead of taking the short way round.
 */
function wallAt(steps: number): 0 | 1 | 2 | 3 {
  return (((-steps % 4) + 4) % 4) as 0 | 1 | 2 | 3;
}

/**
 * A first-person gallery room built from CSS 3D planes: four plaster
 * walls, a floor and a ceiling around the camera. Dragging (or
 * scrolling) turns the camera; Q and R snap it a wall at a time.
 * Clicking a piece pulls the camera onto it and opens its wall label —
 * the link out lives in that panel, so the frame itself never navigates.
 */
export default function PlayGallery() {
  const worldRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  // current follows target with damping for a weighty, settled feel;
  // zoom scales the perspective distance, narrowing the FOV like a dolly-in
  const target = useRef({ yaw: 0, pitch: 0, zoom: 1 });
  const current = useRef({ yaw: 0, pitch: 0, zoom: 1 });
  const dragged = useRef(false);
  // Signed count of quarter-turns from wall 0.
  const steps = useRef(0);
  const [wall, setWall] = useState<0 | 1 | 2 | 3>(0);
  const [selected, setSelected] = useState<PlayItem | null>(null);
  /** Base perspective for the current viewport; the camera zoom multiplies it. */
  const basePersp = useRef(PERSP);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let raf = 0;
    let running = true;
    const tick = () => {
      if (!running) return;
      const c = current.current;
      const t = target.current;
      c.yaw += (t.yaw - c.yaw) * 0.1;
      c.pitch += (t.pitch - c.pitch) * 0.1;
      c.zoom += (t.zoom - c.zoom) * 0.06;
      const persp = basePersp.current * c.zoom;
      if (sceneRef.current) {
        sceneRef.current.style.perspective = `${persp}px`;
      }
      if (worldRef.current) {
        worldRef.current.style.transform = `translateZ(${persp}px) rotateX(${c.pitch}deg) rotateY(${c.yaw}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // The room is laid out in fixed pixels, so the only thing that has to
    // react to a resize is how much of it the camera can see. Observing
    // the viewport rather than the window catches every case: window
    // resizes, orientation changes, and the element being resized by
    // anything else on the page.
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) basePersp.current = perspFor(w);
    });
    ro.observe(viewport);

    let panning = false;
    let captured = 0 | 0;
    let last = { x: 0, y: 0 };

    const down = (e: PointerEvent) => {
      panning = true;
      dragged.current = false;
      last = { x: e.clientX, y: e.clientY };
      // Deliberately NOT capturing here. Capturing on pointerdown routes
      // the following click to the viewport instead of the piece under
      // the cursor, so every click on a frame would be swallowed. Capture
      // only once the pointer has actually moved far enough to be a drag.
    };
    const move = (e: PointerEvent) => {
      if (!panning) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) {
        dragged.current = true;
        if (!captured) {
          viewport.setPointerCapture(e.pointerId);
          captured = e.pointerId;
        }
      }
      last = { x: e.clientX, y: e.clientY };
      target.current.yaw += dx * 0.14;
      target.current.pitch = clampPitch(target.current.pitch - dy * 0.1);
      target.current.zoom = 1;
    };
    const up = () => {
      panning = false;
      if (captured) {
        try {
          viewport.releasePointerCapture(captured);
        } catch {
          /* pointer already gone */
        }
        captured = 0;
      }
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      target.current.yaw += e.deltaX * 0.08 + e.deltaY * 0.08;
      target.current.zoom = 1;
    };
    // A drag should turn the camera, not select the piece under it.
    const click = (e: MouseEvent) => {
      if (dragged.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    viewport.addEventListener("pointerdown", down);
    viewport.addEventListener("pointermove", move);
    viewport.addEventListener("pointerup", up);
    viewport.addEventListener("pointercancel", up);
    viewport.addEventListener("wheel", wheel, { passive: false });
    viewport.addEventListener("click", click, { capture: true });
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      viewport.removeEventListener("pointerdown", down);
      viewport.removeEventListener("pointermove", move);
      viewport.removeEventListener("pointerup", up);
      viewport.removeEventListener("pointercancel", up);
      viewport.removeEventListener("wheel", wheel);
      viewport.removeEventListener("click", click, { capture: true });
      ro.disconnect();
    };
  }, []);

  function clampPitch(v: number) {
    return Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, v));
  }

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function aim(next: { yaw: number; pitch: number; zoom: number }) {
    target.current = next;
    if (reducedMotion()) current.current = { ...next };
  }

  /** Yaw and pitch that put a piece in the middle of the frame. */
  function framing(item: PlayItem) {
    const half = ROOM.size / 2;
    const offAngle = Math.atan((item.x + item.w / 2 - half) / half) * DEG;
    const baseYaw = -item.wall * 90 + offAngle;
    const yawNow = target.current.yaw;
    return {
      yaw: baseYaw + Math.round((yawNow - baseYaw) / 360) * 360,
      pitch: clampPitch(-Math.atan(item.y / half) * DEG),
    };
  }

  function selectPiece(item: PlayItem) {
    setSelected(item);
    aim({ ...framing(item), zoom: FOCUS_ZOOM });
  }

  function deselect() {
    setSelected(null);
    target.current.zoom = 1;
    if (reducedMotion()) current.current.zoom = 1;
  }

  /* Q and R turn a wall at a time. Turning drops any selection: you
     can't be looking closely at one piece and facing another wall. */
  useEffect(() => {
    const turn = (dir: 1 | -1) => {
      steps.current += dir;
      setWall(wallAt(steps.current));
      setSelected(null);
      aim({ yaw: steps.current * 90, pitch: 0, zoom: 1 });
    };

    const key = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === "escape") {
        deselect();
        return;
      }
      if (k !== "q" && k !== "r") return;
      e.preventDefault();
      // Holding the key auto-repeats keydown, which used to stack a
      // quarter-turn per repeat and spin the room. A held key is still
      // one turn: only the press that starts the run counts.
      if (e.repeat) return;
      turn(k === "r" ? 1 : -1);
    };

    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  /* Clicking anywhere that isn't the focused piece or its label leaves
     the focused view. Bound only while something is selected, so the
     rest of the time it costs nothing. */
  useEffect(() => {
    if (!selected) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onClick = (e: MouseEvent) => {
      if (dragged.current) return;
      const el = e.target as HTMLElement | null;
      // Another piece selects itself; the label owns its own controls.
      if (el?.closest(`.${styles.piece}`) || el?.closest(`.${styles.label}`)) {
        return;
      }
      deselect();
    };

    viewport.addEventListener("click", onClick);
    return () => viewport.removeEventListener("click", onClick);
  }, [selected]);

  return (
    <div className={styles.viewport} ref={viewportRef}>
      <div className={styles.scene} ref={sceneRef}>
        <div className={styles.world} ref={worldRef}>
          {WALLS.map((w) => (
            <div
              key={w}
              className={styles.wall}
              style={{
                transform: `rotateY(${w * 90}deg) translateZ(${
                  -ROOM.size / 2
                }px)`,
              }}
            >
              {HUNG.filter((i) => i.wall === w).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  draggable={false}
                  className={`${styles.piece} ${
                    selected && selected.id !== item.id ? styles.dimmed : ""
                  }`}
                  style={{
                    left: item.x,
                    top: `calc(50% + ${item.y}px)`,
                    width: item.w,
                  }}
                  aria-pressed={selected?.id === item.id}
                  onClick={() =>
                    selected?.id === item.id ? deselect() : selectPiece(item)
                  }
                >
                  <span className={styles.frame}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.title} draggable={false} />
                  </span>
                  <span className={styles.plaque}>
                    {item.title} · {item.year}
                  </span>
                </button>
              ))}
            </div>
          ))}
          <div className={styles.floor} />
          <div className={styles.ceiling} />
        </div>
      </div>

      {/* One hint bar at the foot of the room, swapping to the way out
          while a piece is focused. */}
      <p className={styles.hint} aria-hidden="true">
        {selected ? (
          <>
            <span className={styles.hintKeys}>
              <kbd>Esc</kbd>
            </span>
            or click anywhere to step back
          </>
        ) : (
          <>
            Wall {wall + 1} of 4
            <span className={styles.hintKeys}>
              <kbd>Q</kbd>
              <kbd>R</kbd> to turn · drag to look
            </span>
          </>
        )}
      </p>
      <p className="sr-only" aria-live="polite">
        {selected ? selected.title : `Facing wall ${wall + 1} of 4`}
      </p>

      {/* Wall label. Sits beside the piece rather than over it, and owns
          the link out so the frame itself never navigates. */}
      {selected && (
        <aside className={styles.label}>
          <button
            type="button"
            className={styles.close}
            onClick={deselect}
            aria-label="Close"
          >
            ×
          </button>
          <p className="eyebrow">{CATEGORY_LABEL[selected.category]}</p>
          <h2 className={`serif ${styles.labelTitle}`}>{selected.title}</h2>
          <p className={styles.labelMeta}>
            {selected.medium
              ? `${selected.medium} · ${selected.year}`
              : selected.year}
          </p>
          {selected.blurb && (
            <p className={styles.labelBlurb}>{selected.blurb}</p>
          )}
          {/* Originals end at the label: the piece is the thing, so there
              is no "yet" to promise. Placeholders still say so. */}
          {selected.href && selected.href !== "#" ? (
            <a
              className={styles.labelLink}
              href={selected.href}
              target="_blank"
              rel="noreferrer"
            >
              View on {selected.source}
              <span aria-hidden="true"> ↗</span>
            </a>
          ) : selected.medium ? null : (
            <p className={styles.labelSoon}>Nothing to link to yet.</p>
          )}
        </aside>
      )}

    </div>
  );
}
