"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
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
// Cards travel the upper arc of this ellipse. Its center sits well
// below the viewport, so the visible path arches down toward the
// bottom edges of the screen.
const ARC = { cy: -5.4, rx: 8.6, ry: 5.9 };
const HIDE_ANGLE = Math.PI * 0.55; // past this the card is around the bend
// A card is retired over this last stretch rather than switched off, so
// the shadow it casts shrinks away instead of popping.
const FADE_SPAN = 0.3;
// The loop has to be long enough that a card reaches HIDE_ANGLE before
// it wraps to the far side. Below this many cards the wrap happens while
// the card's shadow is still on screen, so the stream repeats its source
// cards up to this count instead of leaving a gap in the arc.
const MIN_STREAM = 9;

/**
 * Placeholder artwork for the card fronts. All roughly square, so each
 * is cover-cropped to the card's 3:2. `focusY` biases that crop when the
 * subject isn't centred (0 = keep the top, 1 = keep the bottom).
 */
const ART = [
  { src: "/postcards/water-sparkle.jpg", focusY: 0.5 },
  { src: "/postcards/forest-light.jpg", focusY: 0.45 },
  { src: "/postcards/tree-sun.jpg", focusY: 0.4 },
  { src: "/postcards/lily-of-the-valley.jpg", focusY: 0.5 },
  { src: "/postcards/aurora-walk.jpg", focusY: 0.72 },
  { src: "/postcards/green-ripple.jpg", focusY: 0.5 },
];

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
     * Cover-crop a square-ish source into the card's 3:2 texture: scale
     * to fill, then slide the overflowing axis to the artwork's focal
     * point. Nothing is squashed, and no bars are left at the edges.
     */
    function makeArtTexture(image: HTMLImageElement, focusY: number) {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext("2d")!;
      const scale = Math.max(
        canvas.width / image.naturalWidth,
        canvas.height / image.naturalHeight
      );
      const w = image.naturalWidth * scale;
      const h = image.naturalHeight * scale;
      ctx.drawImage(
        image,
        (canvas.width - w) / 2,
        (canvas.height - h) * focusY,
        w,
        h
      );
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      return tex;
    }

    function loadImage(src: string) {
      return new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
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
      renderer.shadowMap.enabled = true;
      // VSM rather than PCF: it blurs the shadow map itself, which is
      // the only way to get a genuinely diffuse edge instead of a
      // slightly feathered hard one.
      renderer.shadowMap.type = THREE.VSMShadowMap;
      mount.appendChild(renderer.domElement);

      // Soft indirect bounce, so matte surfaces aren't lit by direct
      // light alone. Kept dim: this is fill, not a second key.
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRT.texture;
      scene.environmentIntensity = 0.25;
      pmrem.dispose();

      // Studio cyclorama. A plain light-grey wall well behind the cards:
      // the gradient across it is cast by the key light rather than
      // painted in, which is what makes it read as a lit set.
      const backdrop = new THREE.Mesh(
        new THREE.PlaneGeometry(80, 46),
        new THREE.MeshStandardMaterial({
          color: 0xececed,
          roughness: 1,
          metalness: 0,
        })
      );
      backdrop.position.set(0, 0, -2);
      backdrop.receiveShadow = true;
      scene.add(backdrop);

      // Kept deliberately low. Ambient that competes with the key light
      // is what flattens a render; the shadows have to carry the form.
      // Total illumination sits near 1.0 so the artwork renders close to
      // its own colour rather than being lifted toward white.
      scene.add(new THREE.AmbientLight(0xffffff, 0.32));
      scene.add(new THREE.HemisphereLight(0xffffff, 0xd4d4da, 0.32));

      // Key: camera-left and only modestly raised. Any higher and the
      // cards throw their shadows off the bottom of the frame instead
      // of onto the backdrop behind them.
      // Neutral studio key: a near-white that leaves the backdrop and
      // the artwork their own colour rather than casting a tint.
      const key = new THREE.DirectionalLight(0xfffaf2, 1.05);
      key.position.set(-3.2, 2.2, 9);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.radius = 7;
      key.shadow.blurSamples = 24;
      key.shadow.bias = 0;
      key.shadow.normalBias = 0.02;
      const shadowCam = key.shadow.camera;
      shadowCam.left = -12;
      shadowCam.right = 12;
      shadowCam.top = 9;
      shadowCam.bottom = -9;
      shadowCam.near = 0.5;
      shadowCam.far = 40;
      shadowCam.updateProjectionMatrix();
      scene.add(key);

      // Off-white fill from the opposite side lifts the shadow side
      // without adding a second set of shadows.
      const fill = new THREE.DirectionalLight(0xe6edff, 0.2);
      fill.position.set(6, -1.5, 5);
      scene.add(fill);

      // Load the artwork up front, then deal it out in a shuffled order
      // so the arc looks different on each visit. Cards outnumber the
      // art, so the deck wraps.
      const artImages = await Promise.all(ART.map((a) => loadImage(a.src)));
      const deck = ART.map((art, i) => ({ art, image: artImages[i] }))
        .filter((entry) => entry.image !== null)
        .sort(() => Math.random() - 0.5);
      if (disposed || !mount) return;

      const geometry = new THREE.BoxGeometry(CARD_W, CARD_H, 0.02);
      const grain = makePaperGrain();
      const edge = new THREE.MeshStandardMaterial({
        color: 0xf2efe6,
        roughness: 0.95,
      });
      const hitGeometry = new THREE.PlaneGeometry(CARD_W, CARD_H);
      const hitMaterial = new THREE.MeshBasicMaterial({ visible: false });

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
        const dealt = deck.length ? deck[i % deck.length] : null;
        const front = new THREE.MeshStandardMaterial({
          map: dealt
            ? makeArtTexture(dealt.image!, dealt.art.focusY)
            : // No artwork reached the browser: fall back to the drawn
              // design so the arc is never a row of blank cards.
              makeTexture((ctx, w, h) =>
                drawPostcardFront(ctx, w, h, card.design)
              ),
          ...paper,
        });
        const back = new THREE.MeshStandardMaterial({
          map: makeTexture((ctx, w, h) =>
            drawPostcardBack(ctx, w, h, card.text, card.name)
          ),
          ...paper,
        });
        // BoxGeometry material order: +x, -x, +y, -y, +z (front), -z (back)
        const mesh = new THREE.Mesh(geometry, [edge, edge, edge, edge, front, back]);
        mesh.castShadow = true;
        const hitPlane = new THREE.Mesh(hitGeometry, hitMaterial);
        const state: CardState = {
          mesh,
          hitPlane,
          baseOffset: i * ANG_SPACING,
          flip: 0,
          targetFlip: 0,
        };
        scene.add(mesh);
        scene.add(hitPlane);
        return state;
      });

      const total = states.length * ANG_SPACING;
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
      };
      const observer = new ResizeObserver(resize);
      observer.observe(mount);
      resize();

      const clock = new THREE.Clock();
      let firstFrame = true;
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

          const x = ARC.rx * Math.sin(a);
          const y = ARC.cy + ARC.ry * Math.cos(a);
          // lean the card along the path: its bottom edge tracks the
          // ellipse tangent at this angle
          const tilt = Math.atan2(-ARC.ry * Math.sin(a), ARC.rx * Math.cos(a));
          s.mesh.position.set(x, y, 0);
          s.mesh.rotation.z = tilt;
          // park the hit plane far away while its card is around the bend
          s.hitPlane.position.set(x, onArc ? y : -100, 0);
          s.hitPlane.rotation.z = tilt;

          s.targetFlip =
            s === hovered || (now < stickyUntil && s.flip > 0.1)
              ? Math.PI
              : 0;
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
