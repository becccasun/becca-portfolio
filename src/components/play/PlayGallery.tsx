"use client";

import { useEffect, useRef, useState } from "react";
import { PLAY_ITEMS, ROOM } from "@/lib/play";
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

const SLOTS = PLAY_ITEMS.map(({ wall, x, y, w }) => ({ wall, x, y, w }));
const HUNG = [...PLAY_ITEMS]
  .sort((a, b) => hash(a.id + "salt") - hash(b.id + "salt"))
  .map((item, i) => ({ ...item, ...SLOTS[i] }));
const DEG = 180 / Math.PI;
const PITCH_LIMIT = 32;
const PERSP = 760;
const LUCKY_ZOOM = 1.7;

/**
 * A first-person gallery room built from CSS 3D planes: four walls, a
 * floor, and a ceiling around the camera. Dragging (or scrolling) turns
 * the camera; the works are real links hung on the walls, so cursor
 * labels and clicks behave like anywhere else on the site.
 * "I'm feeling lucky" swings the camera to a random piece.
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
  const [luckyId, setLuckyId] = useState<string | null>(null);

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
      const persp = PERSP * c.zoom;
      if (sceneRef.current) {
        sceneRef.current.style.perspective = `${persp}px`;
      }
      if (worldRef.current) {
        worldRef.current.style.transform = `translateZ(${persp}px) rotateX(${c.pitch}deg) rotateY(${c.yaw}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    let panning = false;
    let last = { x: 0, y: 0 };

    const down = (e: PointerEvent) => {
      panning = true;
      dragged.current = false;
      last = { x: e.clientX, y: e.clientY };
      viewport.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!panning) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragged.current = true;
      last = { x: e.clientX, y: e.clientY };
      target.current.yaw += dx * 0.14;
      target.current.pitch = clampPitch(target.current.pitch - dy * 0.1);
      target.current.zoom = 1;
    };
    const up = () => {
      panning = false;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      target.current.yaw += e.deltaX * 0.08 + e.deltaY * 0.08;
      target.current.zoom = 1;
    };
    // A drag should turn the camera, not follow the link under it.
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
    };
  }, []);

  function clampPitch(v: number) {
    return Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, v));
  }

  function feelingLucky() {
    const item = HUNG[Math.floor(Math.random() * HUNG.length)];
    const half = ROOM.size / 2;

    // Yaw that faces the piece: the wall's angle plus the piece's
    // horizontal offset from the wall's center, as seen from the room's
    // middle. Take the equivalent angle nearest the current yaw.
    const offAngle = Math.atan((item.x + item.w / 2 - half) / half) * DEG;
    const baseYaw = -item.wall * 90 + offAngle;
    const yawNow = target.current.yaw;
    const yaw = baseYaw + Math.round((yawNow - baseYaw) / 360) * 360;
    const pitch = clampPitch(-Math.atan(item.y / half) * DEG);

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    target.current = { yaw, pitch, zoom: LUCKY_ZOOM };
    if (reduced) current.current = { yaw, pitch, zoom: LUCKY_ZOOM };

    setLuckyId(null);
    window.setTimeout(() => setLuckyId(item.id), reduced ? 50 : 700);
  }

  useEffect(() => {
    if (!luckyId) return;
    // Hold on the piece, then ease the zoom back out.
    const t = setTimeout(() => {
      setLuckyId(null);
      target.current.zoom = 1;
    }, 2600);
    return () => clearTimeout(t);
  }, [luckyId]);

  return (
    <div className={styles.viewport} ref={viewportRef} data-cursor>
      <div className={styles.scene} ref={sceneRef}>
        <div className={styles.world} ref={worldRef}>
          {WALLS.map((wall) => (
            <div
              key={wall}
              className={styles.wall}
              style={{
                transform: `rotateY(${wall * 90}deg) translateZ(${
                  -ROOM.size / 2
                }px)`,
              }}
            >
              {HUNG.filter((i) => i.wall === wall).map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  draggable={false}
                  className={`${styles.piece} ${
                    luckyId === item.id ? styles.lucky : ""
                  }`}
                  style={{
                    left: item.x,
                    top: `calc(50% + ${item.y}px)`,
                    width: item.w,
                  }}
                  data-cursor-label={`View on ${item.source}`}
                >
                  <span className={styles.frame}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.title} draggable={false} />
                  </span>
                  <span className={styles.plaque}>
                    {item.title} · {item.year}
                  </span>
                </a>
              ))}
            </div>
          ))}
          <div className={styles.floor} />
          <div className={styles.ceiling} />
        </div>
      </div>

      <p className={styles.hint} aria-hidden="true">
        Scroll and drag to look around
      </p>
      <div className={styles.luckyBar}>
        <button className={styles.luckyBtn} onClick={feelingLucky}>
          I&apos;m feeling lucky
        </button>
      </div>
    </div>
  );
}
