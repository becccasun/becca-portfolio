"use client";

import { useEffect, useRef, useState } from "react";
import { PLANE, PLAY_ITEMS } from "@/lib/play";
import styles from "./PlayCanvas.module.css";

const TILES = [-1, 0, 1];

function mod(v: number, m: number) {
  return ((v % m) + m) % m;
}

/**
 * Infinite canvas: items live on a virtual plane that tiles in every
 * direction (a 3x3 grid of the plane, translated by the pan offset
 * modulo the plane size, so panning never hits an edge). Drag or
 * scroll to pan; "I'm feeling lucky" glides a random piece to center.
 */
export default function PlayCanvas() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const anim = useRef(0);
  const dragged = useRef(false);
  const [luckyId, setLuckyId] = useState<string | null>(null);

  function apply() {
    if (!worldRef.current) return;
    const tx = mod(offset.current.x, PLANE.w) - PLANE.w;
    const ty = mod(offset.current.y, PLANE.h) - PLANE.h;
    worldRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
  }

  function schedule() {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      apply();
    });
  }

  useEffect(() => {
    apply();
    const viewport = viewportRef.current;
    if (!viewport) return;

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
      cancelAnimationFrame(anim.current);
      offset.current.x += dx;
      offset.current.y += dy;
      schedule();
    };
    const up = () => {
      panning = false;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      cancelAnimationFrame(anim.current);
      offset.current.x -= e.deltaX;
      offset.current.y -= e.deltaY;
      schedule();
    };
    // A drag should pan, not follow the link under the pointer.
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
      viewport.removeEventListener("pointerdown", down);
      viewport.removeEventListener("pointermove", move);
      viewport.removeEventListener("pointerup", up);
      viewport.removeEventListener("pointercancel", up);
      viewport.removeEventListener("wheel", wheel);
      viewport.removeEventListener("click", click, { capture: true });
      cancelAnimationFrame(raf.current);
      cancelAnimationFrame(anim.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function feelingLucky() {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const item = PLAY_ITEMS[Math.floor(Math.random() * PLAY_ITEMS.length)];
    const rect = viewport.getBoundingClientRect();

    // Offset that puts the item's center at the viewport's center,
    // shifted by whole planes to take the shortest path from here.
    const itemH = item.w * 0.75;
    const targetBase = {
      x: rect.width / 2 - item.x - item.w / 2,
      y: rect.height / 2 - item.y - itemH / 2,
    };
    const from = { ...offset.current };
    const to = {
      x:
        targetBase.x +
        Math.round((from.x - targetBase.x) / PLANE.w) * PLANE.w,
      y:
        targetBase.y +
        Math.round((from.y - targetBase.y) / PLANE.h) * PLANE.h,
    };

    cancelAnimationFrame(anim.current);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      offset.current = to;
      apply();
      setLuckyId(item.id);
      return;
    }

    const start = performance.now();
    const duration = 900;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = ease(t);
      offset.current = {
        x: from.x + (to.x - from.x) * e,
        y: from.y + (to.y - from.y) * e,
      };
      apply();
      if (t < 1) anim.current = requestAnimationFrame(step);
      else setLuckyId(item.id);
    };
    anim.current = requestAnimationFrame(step);
  }

  useEffect(() => {
    if (!luckyId) return;
    const t = setTimeout(() => setLuckyId(null), 1800);
    return () => clearTimeout(t);
  }, [luckyId]);

  return (
    <div className={styles.viewport} ref={viewportRef} data-cursor>
      <div className={styles.world} ref={worldRef}>
        {TILES.map((ti) =>
          TILES.map((tj) => (
            <div
              key={`${ti}:${tj}`}
              className={styles.tile}
              style={{
                transform: `translate(${(ti + 1) * PLANE.w}px, ${
                  (tj + 1) * PLANE.h
                }px)`,
              }}
            >
              {PLAY_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  draggable={false}
                  className={`${styles.item} ${
                    luckyId === item.id ? styles.lucky : ""
                  }`}
                  style={{ left: item.x, top: item.y, width: item.w }}
                  data-cursor-label={`View on ${item.source}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.title} draggable={false} />
                  <span className={styles.itemMeta}>
                    {item.title} · {item.year}
                  </span>
                </a>
              ))}
            </div>
          ))
        )}
      </div>

      <div className={styles.luckyBar}>
        <button className={styles.luckyBtn} onClick={feelingLucky}>
          I&apos;m feeling lucky
        </button>
      </div>
    </div>
  );
}
