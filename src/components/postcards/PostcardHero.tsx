"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import * as THREE from "three";
import {
  drawPostcardFront,
  drawPostcardBack,
  PRESET_CARDS,
  type PostcardData,
} from "@/lib/postcards-client";
import styles from "./PostcardHero.module.css";

const CARD_W = 3.3;
const CARD_H = 2.2;
const SPACING = 4.1;
const BASE_SPEED = 0.55; // world units per second
const CARD_Y = 0.45; // one shared baseline for every card
const FLIP_EASE = 0.045; // slow, settled flip

type CardState = {
  mesh: THREE.Mesh;
  /** Invisible, never-rotating plane used for hover raycasts, so the
   *  hit area stays stable while the card itself flips. */
  hitPlane: THREE.Mesh;
  baseOffset: number;
  flip: number;
  targetFlip: number;
};

/**
 * Full-viewport hero: a stream of 3D postcards drifting across the
 * screen (tastelabs.com-style). Each card's front is a designed
 * graphic; hovering the card nearest center pauses the stream and
 * flips it to the written side. Visitor-made cards from /postcard
 * join the stream after moderation.
 */
export default function PostcardHero() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let raf = 0;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function makeTexture(
      draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
      mirrored = false
    ) {
      const canvas = document.createElement("canvas");
      canvas.width = 768;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;
      draw(ctx, canvas.width, canvas.height);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      if (mirrored) {
        // the back face reads correctly once the card is flipped
        tex.wrapS = THREE.RepeatWrapping;
        tex.repeat.x = -1;
      }
      return tex;
    }

    async function init() {
      let cards: PostcardData[] = PRESET_CARDS;
      try {
        const res = await fetch("/api/postcards");
        const data = await res.json();
        if (Array.isArray(data.cards) && data.cards.length) cards = data.cards;
      } catch {
        /* presets remain the fallback */
      }
      if (disposed || !mount) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        32,
        mount.clientWidth / mount.clientHeight,
        0.1,
        100
      );
      camera.position.set(0, 0.15, 9.6);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      mount.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 1.6));
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(3, 5, 8);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xdbe7ff, 0.5);
      fill.position.set(-4, -2, 6);
      scene.add(fill);

      const geometry = new THREE.BoxGeometry(CARD_W, CARD_H, 0.03);
      const edge = new THREE.MeshStandardMaterial({ color: 0xf2efe6 });
      const hitGeometry = new THREE.PlaneGeometry(CARD_W, CARD_H);
      const hitMaterial = new THREE.MeshBasicMaterial({ visible: false });

      const states: CardState[] = cards.map((card, i) => {
        const front = new THREE.MeshStandardMaterial({
          map: makeTexture((ctx, w, h) => drawPostcardFront(ctx, w, h, card.design)),
          roughness: 0.85,
        });
        const back = new THREE.MeshStandardMaterial({
          map: makeTexture(
            (ctx, w, h) => drawPostcardBack(ctx, w, h, card.text, card.name),
            true
          ),
          roughness: 0.9,
        });
        // BoxGeometry material order: +x, -x, +y, -y, +z (front), -z (back)
        const mesh = new THREE.Mesh(geometry, [edge, edge, edge, edge, front, back]);
        const hitPlane = new THREE.Mesh(hitGeometry, hitMaterial);
        mesh.position.y = CARD_Y;
        hitPlane.position.y = CARD_Y;
        const state: CardState = {
          mesh,
          hitPlane,
          baseOffset: i * SPACING,
          flip: 0,
          targetFlip: 0,
        };
        scene.add(mesh);
        scene.add(hitPlane);
        return state;
      });

      const total = states.length * SPACING;
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2(-10, -10);
      let hovered: CardState | null = null;
      let stickyUntil = 0; // touch: hold the flip briefly after a tap
      let speed = reduced ? 0 : BASE_SPEED;
      let scroll = 0;

      const onPointerMove = (e: PointerEvent) => {
        const rect = mount.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      };
      const onPointerDown = () => {
        if (hovered) stickyUntil = performance.now() + 2600;
      };
      const onLeave = () => pointer.set(-10, -10);
      mount.addEventListener("pointermove", onPointerMove);
      mount.addEventListener("pointerdown", onPointerDown);
      mount.addEventListener("pointerleave", onLeave);

      const onResize = () => {
        if (!renderer) return;
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
      };
      window.addEventListener("resize", onResize);

      const clock = new THREE.Clock();
      const animate = () => {
        if (disposed || !renderer) return;
        const dt = Math.min(clock.getDelta(), 0.05);
        const now = performance.now();

        // Raycast the static hit planes, never the flipping cards: a
        // mid-flip card turns edge-on and would drop the hover, making
        // it oscillate open and shut.
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(states.map((s) => s.hitPlane));
        const hitPlane = hits[0]?.object;
        hovered = states.find((s) => s.hitPlane === hitPlane) ?? null;

        const holding = hovered !== null || now < stickyUntil;
        const speedTarget = reduced ? 0 : holding ? 0 : BASE_SPEED;
        speed += (speedTarget - speed) * (reduced ? 1 : 0.06);
        scroll += speed * dt;

        for (const s of states) {
          const x =
            ((((s.baseOffset - scroll) % total) + total) % total) - total / 2;
          s.mesh.position.x = x;
          s.hitPlane.position.x = x;

          s.targetFlip =
            s === hovered || (now < stickyUntil && s.flip > 0.1)
              ? Math.PI
              : 0;
          s.flip += (s.targetFlip - s.flip) * (reduced ? 1 : FLIP_EASE);
          s.mesh.rotation.y = s.flip;
        }

        mount.style.cursor = hovered ? "pointer" : "default";
        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        mount.removeEventListener("pointermove", onPointerMove);
        mount.removeEventListener("pointerdown", onPointerDown);
        mount.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("resize", onResize);
      };
    }

    const cleanupPromise = init();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanupPromise.then((fn) => fn?.());
      renderer?.dispose();
      if (mount) mount.innerHTML = "";
    };
  }, []);

  return (
    <section className={styles.hero} aria-label="Postcards">
      <div ref={mountRef} className={styles.canvas} />

      <div className={styles.overlay}>
        <Link href="/postcard" className={styles.cta}>
          <span>Leave your own postcard</span>
          <svg
            viewBox="0 0 52 44"
            width="52"
            height="44"
            className={styles.ctaHex}
            aria-hidden="true"
          >
            <path
              d="M16 2 L36 2 L50 22 L36 42 L16 42 L2 22 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M20 28 L32 16 M24 16 L32 16 L32 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      <p className={`${styles.corner} ${styles.cornerLeft}`}>
        Currently designing at Loop Financial
      </p>
      <p className={`${styles.corner} ${styles.cornerRight}`}>
        Studying UX and AI at the University of Michigan
      </p>
    </section>
  );
}
