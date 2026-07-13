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
const CENTER_ZONE = 1.7; // |x| within which a hovered card flips

type CardState = {
  mesh: THREE.Mesh;
  baseOffset: number;
  baseY: number;
  baseRotZ: number;
  flip: number;
  targetFlip: number;
  phase: number;
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
        const state: CardState = {
          mesh,
          baseOffset: i * SPACING,
          baseY: 0.55 + (i % 3) * 0.14 - 0.14,
          baseRotZ: ((i * 7919) % 10) / 10 * 0.07 - 0.035,
          flip: 0,
          targetFlip: 0,
          phase: i * 1.7,
        };
        scene.add(mesh);
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

        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(states.map((s) => s.mesh));
        const hitMesh = hits[0]?.object;
        hovered =
          states.find(
            (s) =>
              s.mesh === hitMesh && Math.abs(s.mesh.position.x) < CENTER_ZONE
          ) ?? null;

        const holding = hovered !== null || now < stickyUntil;
        const speedTarget = reduced ? 0 : holding ? 0 : BASE_SPEED;
        speed += (speedTarget - speed) * (reduced ? 1 : 0.06);
        scroll += speed * dt;

        for (const s of states) {
          const x =
            ((((s.baseOffset - scroll) % total) + total) % total) - total / 2;
          s.mesh.position.x = x;
          s.mesh.position.y =
            s.baseY + (reduced ? 0 : Math.sin(now / 1400 + s.phase) * 0.05);
          s.mesh.rotation.z = s.baseRotZ;

          s.targetFlip =
            s === hovered || (now < stickyUntil && s.flip > 0.1)
              ? Math.PI
              : 0;
          s.flip += (s.targetFlip - s.flip) * (reduced ? 1 : 0.09);
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
        <h1 className={`serif ${styles.identity}`}>
          I design and build beautiful experiences with visual craft, system
          thinking, and product strategy.
        </h1>
        <Link href="/postcard" className={styles.cta}>
          Leave your own postcard
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
