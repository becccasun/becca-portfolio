"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  ART_OPTIONS,
  STAMP_OPTIONS,
  preloadPostcardImage,
  readyImage,
  stampSrc,
  drawPostcardFront,
  drawPostcardBack,
  PRESET_CARDS,
  type PostcardData,
} from "@/lib/postcards-client";
import styles from "./PostcardHero.module.css";

const CARD_W = 2.55;
const CARD_H = 1.7;
const ANG_SPACING = 0.46; // radians between cards along the arc
const BASE_SPEED = 0.07; // radians per second
const FLIP_EASE = 0.045; // slow, settled flip
// Seconds the stream takes to give up (or pick back up) most of its
// speed. Paired with the smoothstep below it reads as a glide rather
// than a brake: no jolt at either end of the stop.
const GLIDE_TAU = 0.42;
// Cards travel the upper arc of this ellipse. Its center sits well
// below the viewport, so the visible path arches down toward the
// bottom edges of the screen.
// Wider and shallower than it looks like it needs to be, and for a
// specific reason: the cards near the left and right edges used to sit
// low enough that the shadow they cast ran past the bottom of the hero
// and was sliced off by the border against the work section. Same apex
// (cy + ry = 0.5), so the composition at centre is unchanged; the ends
// of the arc just don't dive as far. Keep cy = 0.5 - ry when tuning.
const ARC = { cy: -4.5, rx: 10.4, ry: 5 };
// rx is tuned for this shape of window. Wider ones see further along the
// arc, where it dives, so the ellipse stretches to match and they keep
// seeing the same flat middle stretch instead of the ends.
const ARC_REF_ASPECT = 2.1;
const HIDE_ANGLE = Math.PI * 0.55; // past this the card is around the bend
// A card is retired over this last stretch rather than switched off, so
// the shadow it casts shrinks away instead of popping.
const FADE_SPAN = 0.3;
// The loop has to be long enough that a card reaches HIDE_ANGLE before
// it wraps to the far side. Below this many cards the wrap happens while
// the card's shadow is still on screen, so the stream repeats its source
// cards up to this count instead of leaving a gap in the arc.
const MIN_STREAM = 9;
// Each card carries its own shadow quad instead of casting onto a wall
// behind the stream. A real cast shadow lands on a plane further from
// the camera than the cards, and perspective then swings it across the
// frame: it sat ~200px to the right of a card on the left edge and
// ~50px to the left of one on the right edge. Riding just behind its
// own card, at the same depth, the offset is identical everywhere.
const SHADOW_OFFSET = { x: 0.3, y: -0.34 };
const SHADOW_DEPTH = -0.06; // just behind the card, so overlap hides it
const SHADOW_PAD = 0.55; // room around the card for the blur to spread
const SHADOW_OPACITY = 0.22;

type CardState = {
  mesh: THREE.Mesh;
  /** Invisible, never-rotating plane used for hover raycasts, so the
   *  hit area stays stable while the card itself flips. */
  hitPlane: THREE.Mesh;
  baseOffset: number;
  /** Soft quad tracking this card, standing in for a cast shadow. */
  shadow: THREE.Mesh;
  flip: number;
  targetFlip: number;
  /** Latched by a click, not by the pointer resting on the card. */
  flipped: boolean;
};

/**
 * Full-viewport hero: a stream of 3D postcards drifting across the
 * screen (tastelabs.com-style). Each card's front is a designed
 * graphic. Hovering a card eases the stream to a stop; clicking it
 * flips it to the written side and leaves it there until clicked
 * again. Visitor-made cards from /postcard join after moderation.
 */
export default function PostcardHero() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

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
      draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
    ) {
      // No mirroring: a box's back face is viewed from its own front
      // once the card has flipped, so a normally drawn texture reads
      // correctly.
      const canvas = document.createElement("canvas");
      canvas.width = 768;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;
      draw(ctx, canvas.width, canvas.height);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      return tex;
    }

    /**
     * Paper grain, generated once and shared by every card. Drives both
     * the bump and the roughness so the stock catches the key light
     * unevenly the way real card does, instead of reading as a flat
     * printed rectangle.
     */
    function makePaperGrain() {
      const size = 512;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const img = ctx.createImageData(size, size);
      for (let i = 0; i < img.data.length; i += 4) {
        const n = 132 + (Math.random() - 0.5) * 54;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      // Soften the noise into fibre; raw per-pixel noise reads as static.
      ctx.filter = "blur(0.7px)";
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = "none";
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2.5, 1.7);
      return tex;
    }

    /**
     * A card-shaped blur on a transparent field, shared by every card.
     * The rectangle is drawn inset by the padding so the blur has room
     * to fall off inside the texture instead of clipping at its edge.
     */
    function makeShadowTexture() {
      const w = CARD_W + SHADOW_PAD * 2;
      const h = CARD_H + SHADOW_PAD * 2;
      const px = 512 / w; // pixels per world unit
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(w * px);
      canvas.height = Math.round(h * px);
      const ctx = canvas.getContext("2d")!;
      const inset = SHADOW_PAD * px;
      ctx.filter = `blur(${(SHADOW_PAD * px) / 2.4}px)`;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.roundRect(
        inset,
        inset,
        canvas.width - inset * 2,
        canvas.height - inset * 2,
        10
      );
      ctx.fill();
      ctx.filter = "none";
      const tex = new THREE.CanvasTexture(canvas);
      tex.anisotropy = 4;
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
      // Khronos PBR Neutral rather than ACES: it rolls highlights off
      // without pulling saturation out of the artwork, which ACES does
      // badly to the greens and blues on these cards.
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.toneMappingExposure = 1;
      // No shadow map: the cards carry their own shadow quads, which
      // keeps the offset even across the frame (see SHADOW_OFFSET).
      mount.appendChild(renderer.domElement);

      // Soft indirect bounce, so matte surfaces aren't lit by direct
      // light alone. Kept dim: this is fill, not a second key.
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRT.texture;
      scene.environmentIntensity = 0.25;
      pmrem.dispose();

      // No backdrop at all: the canvas is transparent, so the page's
      // own --bg shows through and the hero matches every other page.

      // Kept deliberately low. Ambient that competes with the key light
      // is what flattens a render; the shadows have to carry the form.
      // Total illumination sits near 1.0 so the artwork renders close to
      // its own colour rather than being lifted toward white.
      scene.add(new THREE.AmbientLight(0xffffff, 0.32));
      scene.add(new THREE.HemisphereLight(0xffffff, 0xd4d4da, 0.32));

      // Key: camera-left and only modestly raised, shaping the card
      // faces. It no longer casts — SHADOW_OFFSET does that job — so
      // its angle is free to serve the lighting alone.
      // Neutral studio key: a near-white that leaves the artwork its
      // own colour rather than casting a tint.
      const key = new THREE.DirectionalLight(0xfffaf2, 1.05);
      key.position.set(-3.2, 2.2, 9);
      scene.add(key);

      // Off-white fill from the opposite side lifts the shadow side
      // without adding a second set of shadows.
      const fill = new THREE.DirectionalLight(0xe6edff, 0.2);
      fill.position.set(6, -1.5, 5);
      scene.add(fill);

      // Decode every picture and stamp before building textures, so each
      // card renders the pair its author actually chose.
      await Promise.all([
        ...ART_OPTIONS.map((o) => preloadPostcardImage(o.src)),
        ...STAMP_OPTIONS.map((o) => preloadPostcardImage(o.src)),
      ]);
      if (disposed || !mount) return;

      const geometry = new THREE.BoxGeometry(CARD_W, CARD_H, 0.02);
      const grain = makePaperGrain();
      const edge = new THREE.MeshStandardMaterial({
        color: 0xf2efe6,
        roughness: 0.95,
      });
      const hitGeometry = new THREE.PlaneGeometry(CARD_W, CARD_H);
      const hitMaterial = new THREE.MeshBasicMaterial({ visible: false });

      // One geometry and one material for every card's shadow. Sitting
      // 0.06 behind its own card, the overlap is hidden by depth and
      // only the offset penumbra shows.
      const shadowGeometry = new THREE.PlaneGeometry(
        CARD_W + SHADOW_PAD * 2,
        CARD_H + SHADOW_PAD * 2
      );
      const shadowMaterial = new THREE.MeshBasicMaterial({
        map: makeShadowTexture(),
        color: 0x000000,
        transparent: true,
        opacity: SHADOW_OPACITY,
        depthWrite: false,
      });

      // Repeat the source cards up to MIN_STREAM so the arc wraps well
      // off screen. Spacing stays the same, so the stream reads the same;
      // there are just more of them around the unseen part of the loop.
      const stream = Array.from(
        { length: Math.max(MIN_STREAM, cards.length) },
        (_, i) => cards[i % cards.length]
      );

      const states: CardState[] = stream.map((card, i) => {
        const paper = {
          roughness: 0.88,
          roughnessMap: grain,
          bumpMap: grain,
          bumpScale: 0.5,
          metalness: 0,
        };
        const front = new THREE.MeshStandardMaterial({
          map: makeTexture((ctx, w, h) =>
            drawPostcardFront(ctx, w, h, card.design)
          ),
          ...paper,
        });
        const back = new THREE.MeshStandardMaterial({
          map: makeTexture((ctx, w, h) =>
            drawPostcardBack(
              ctx,
              w,
              h,
              card.text,
              { name: card.name, city: card.city, role: card.role },
              readyImage(stampSrc(card.design.stamp))
            )
          ),
          ...paper,
        });
        // BoxGeometry material order: +x, -x, +y, -y, +z (front), -z (back)
        const mesh = new THREE.Mesh(geometry, [edge, edge, edge, edge, front, back]);
        const hitPlane = new THREE.Mesh(hitGeometry, hitMaterial);
        const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        const state: CardState = {
          mesh,
          hitPlane,
          shadow,
          baseOffset: i * ANG_SPACING,
          flip: 0,
          targetFlip: 0,
          flipped: false,
        };
        scene.add(shadow);
        scene.add(mesh);
        scene.add(hitPlane);
        return state;
      });

      const total = states.length * ANG_SPACING;
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2(-10, -10);
      let hovered: CardState | null = null;
      // 1 = full speed, 0 = held. Eased in the loop rather than snapped.
      let glide = reduced ? 0 : 1;
      let scroll = 0;
      let arcRx = ARC.rx; // widened for wide windows; set in resize()

      // Whether the pointer is over the canvas at all. Without this the
      // parked pointer still casts a ray, and at those extreme angles it
      // can strike a hit plane retired off-screen — which read as a
      // phantom hover: stream stopped, "Click me" stuck on the cursor.
      let pointerInside = false;

      const trackPointer = (e: PointerEvent) => {
        const rect = mount.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        pointerInside =
          Math.abs(pointer.x) <= 1 && Math.abs(pointer.y) <= 1;
      };
      const pick = () => {
        if (!pointerInside) return null;
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(states.map((s) => s.hitPlane))[0]
          ?.object;
        return states.find((s) => s.hitPlane === hit) ?? null;
      };

      // The label lives on the custom cursor, which tracks DOM hover and
      // so can't see a card picked out of the canvas by a raycast. Tell
      // it directly, and only when the answer changes.
      const setCursorLabel = (label: string | null) => {
        window.dispatchEvent(
          new CustomEvent("cursor:label", { detail: { label } })
        );
      };

      const onPointerMove = trackPointer;
      // Touch has no hover to pick from, so place the pointer first.
      const onPointerDown = (e: PointerEvent) => {
        trackPointer(e);
        const target = pick();
        if (target) target.flipped = !target.flipped;
      };
      const onLeave = () => {
        pointer.set(-10, -10);
        pointerInside = false;
        setCursorLabel(null);
      };
      mount.addEventListener("pointermove", onPointerMove);
      mount.addEventListener("pointerdown", onPointerDown);
      mount.addEventListener("pointerleave", onLeave);

      // Watch the container, not the window. The hero's height also
      // changes from CSS and from the mobile URL bar collapsing, and
      // neither of those fires a resize event, which leaves the canvas
      // at a stale size and a strip of the viewport unpainted.
      const resize = () => {
        if (!renderer) return;
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        // Never narrower than the tuned value: on portrait windows only
        // the apex is in frame, so there is nothing to flatten.
        arcRx = ARC.rx * Math.max(1, camera.aspect / ARC_REF_ASPECT);
      };
      const observer = new ResizeObserver(resize);
      observer.observe(mount);
      resize();

      const clock = new THREE.Clock();
      let firstFrame = true;
      const animate = () => {
        if (disposed || !renderer) return;
        const dt = Math.min(clock.getDelta(), 0.05);

        // Raycast the static hit planes, never the flipping cards: a
        // mid-flip card turns edge-on and would drop the hover, making
        // it oscillate open and shut.
        const wasHovered = hovered;
        hovered = pick();
        if (hovered !== wasHovered) {
          setCursorLabel(hovered ? "Click me" : null);
        }

        // Two stages of easing. The exponential approach is frame-rate
        // independent (the old per-frame lerp ran faster on a 120Hz
        // screen), and the smoothstep on top gives the S-curve: the
        // stream leans out of motion and leans back into it instead of
        // decaying straight to a halt.
        const glideTarget = reduced || hovered ? 0 : 1;
        glide += (glideTarget - glide) * (1 - Math.exp(-dt / GLIDE_TAU));
        const eased = glide * glide * (3 - 2 * glide);
        scroll += (reduced ? 0 : BASE_SPEED * eased) * dt;

        for (const s of states) {
          // angle along the arc, wrapped around the full loop; 0 = apex
          const a =
            ((((s.baseOffset - scroll) % total) + total) % total) - total / 2;

          // Retire the card over the last FADE_SPAN of its run instead of
          // switching it off at a hard angle. Scaling shrinks the cast
          // shadow with it, so nothing vanishes mid-frame. The whole fade
          // happens past the edge of the viewport, so the card itself is
          // never seen shrinking.
          const edge = Math.min(HIDE_ANGLE, total / 2);
          const t = Math.min(
            1,
            Math.max(0, (edge - Math.abs(a)) / FADE_SPAN)
          );
          const scale = t * t * (3 - 2 * t); // smoothstep
          const onArc = scale > 0.01;
          s.mesh.visible = onArc;
          s.mesh.scale.setScalar(scale);

          const x = arcRx * Math.sin(a);
          const y = ARC.cy + ARC.ry * Math.cos(a);
          // lean the card along the path: its bottom edge tracks the
          // ellipse tangent at this angle
          const tilt = Math.atan2(-ARC.ry * Math.sin(a), arcRx * Math.cos(a));
          s.mesh.position.set(x, y, 0);
          s.mesh.rotation.z = tilt;
          // park the hit plane far away while its card is around the bend
          s.hitPlane.position.set(x, onArc ? y : -100, 0);
          s.hitPlane.rotation.z = tilt;

          // The shadow takes the card's tilt and scale, but its offset
          // stays in world axes rather than the card's own frame: one
          // light source for the whole stream, so the shadow falls the
          // same way on every card however it happens to be leaning.
          s.shadow.visible = onArc;
          s.shadow.position.set(
            x + SHADOW_OFFSET.x * scale,
            y + SHADOW_OFFSET.y * scale,
            SHADOW_DEPTH
          );
          s.shadow.rotation.z = tilt;
          s.shadow.scale.setScalar(scale);

          // A card that has gone around the bend resets, so it doesn't
          // come back around still showing its message.
          if (!onArc && s.flipped) s.flipped = false;

          s.targetFlip = s.flipped ? Math.PI : 0;
          s.flip += (s.targetFlip - s.flip) * (reduced ? 1 : FLIP_EASE);
          s.mesh.rotation.y = s.flip;
        }

        mount.style.cursor = hovered ? "pointer" : "default";
        renderer.render(scene, camera);
        if (firstFrame) {
          firstFrame = false;
          setReady(true);
        }
        raf = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        mount.removeEventListener("pointermove", onPointerMove);
        mount.removeEventListener("pointerdown", onPointerDown);
        mount.removeEventListener("pointerleave", onLeave);
        observer.disconnect();
        // Never leave the cursor stuck reading "Click Me" after the
        // hero unmounts mid-hover.
        setCursorLabel(null);
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
      <div
        ref={mountRef}
        className={`${styles.canvas} ${ready ? styles.canvasReady : ""}`}
      />

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
