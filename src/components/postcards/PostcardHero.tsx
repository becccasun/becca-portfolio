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

/* Every card is this one landscape frame. Paintings are cropped to fill
   it rather than stretched. */
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
// Shadows render in their own pass, on this layer, before the cards. A
// flipping card rotates about its own Y axis, so half of it swings back
// past 0.06 — at anything beyond ~3° of flip its rear edge is already
// behind the shadow plane, and depth testing then drew the shadow
// slicing across the card. Painting all the shadows first and clearing
// depth means a card can never intersect one, however far it turns,
// while the offset stays small enough to keep left and right symmetric.
const SHADOW_LAYER = 1;
const SHADOW_PAD = 0.55; // room around the card for the blur to spread
const SHADOW_OPACITY = 0.22;

/* --- Focused card ---------------------------------------------------
   Clicking a card lifts it out of the stream: it travels to the middle
   of the screen, comes upright, and grows until it can actually be
   read.

   FOCUS_Z is the number that matters, and it is not a taste decision.
   A card turning about its own Y axis sweeps a circle whose radius is
   its half-width: CARD_W / 2 × FOCUS_SCALE, about 1.34 world units at
   the current scale. Sitting any closer to the stream than that, the
   card's leading corner passes through the cards behind it as it flips.
   At z = 3 the nearest point of the sweep is still 1.66 clear of the
   stream, and stays in front of the veil at 0.9, so the turn happens in
   its own air.

   Apparent size is scale ÷ (9.6 − z), so the two constants move
   together: change one and recompute the other, or the card will grow
   or shrink on screen when you only meant to move it. */
const FOCUS_SCALE = 1.05;
/* Dead centre of the frame. The camera sits at y = 0.15 and looks
   straight down -Z, so matching its height is what actually centres the
   card vertically — 0 would sit slightly low. */
const FOCUS_Y = 0.15;
const FOCUS_Z = 3;
/* How far the card yields where the pointer rests on it, in radians.
   Small on purpose: it should read as a sheet of card taking a little
   pressure, not as a control tilting. */
const PRESS_MAX = 0.085;
/* Seconds for the press to reach the pointer. Quicker than the focus
   travel — a hand does not lag behind itself. */
const PRESS_TAU = 0.12;
/* Seconds for the focus transition to give up most of its distance.
   Exponential rather than a per-frame lerp so it runs at the same speed
   on a 60Hz and a 120Hz screen, and so it eases in rather than
   starting at full tilt. */
const FOCUS_TAU = 0.38;

/* The veil: a sheet of the page's own colour hung between the stream
   and the card being read. It is a real object in the scene rather than
   a tint on the cards, which is the whole point — the cards are not
   washed out, they are simply behind something. Everything else back
   there is behind it too, so the whole ground recedes together.

   Sits at VEIL_Z, which has to clear the stream and stay outside the
   focused card's sweep: 0 < 0.9 < 1.2. */
const DIM = 0.72;
const VEIL_Z = 0.9;

/* The card being read paints in a pass of its own, after the stream,
   its shadows and the veil have all been laid down. Depth is cleared
   before that pass, so nothing behind can intersect it however far it
   turns. */
const FOCUS_LAYER = 2;

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
  /** 0 in the stream, 1 held at the centre of the screen. Eased. */
  focus: number;
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
  // Mirrors the focused card inside the scene. The loop owns the card
  // itself; this only decides which overlay the DOM shows.
  const [focused, setFocused] = useState(false);

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
      // The frame is drawn in two passes, so clearing is done by hand —
      // otherwise the second pass would wipe the first.
      renderer.autoClear = false;
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
      /* Every light has to be visible to BOTH passes.
         WebGLRenderer collects lights the same way it collects meshes —
         a light only joins the render list if light.layers.test(camera.layers)
         passes. The focused card renders with the camera restricted to
         FOCUS_LAYER, so lights left on layer 0 alone were dropped from
         that pass entirely, and the card came out lit by the
         environment map and nothing else. It read as the card dimming
         the moment it was picked up. `enable` adds the layer without
         removing layer 0, so both passes see the full rig. */
      const lit = (light: THREE.Light) => {
        light.layers.enable(FOCUS_LAYER);
        scene.add(light);
        return light;
      };

      lit(new THREE.AmbientLight(0xffffff, 0.32));
      lit(new THREE.HemisphereLight(0xffffff, 0xd4d4da, 0.32));

      // Key: camera-left and only modestly raised, shaping the card
      // faces. It no longer casts — SHADOW_OFFSET does that job — so
      // its angle is free to serve the lighting alone.
      // Neutral studio key: a near-white that leaves the artwork its
      // own colour rather than casting a tint.
      const key = new THREE.DirectionalLight(0xfffaf2, 1.05);
      key.position.set(-3.2, 2.2, 9);
      lit(key);

      // Off-white fill from the opposite side lifts the shadow side
      // without adding a second set of shadows.
      const fill = new THREE.DirectionalLight(0xe6edff, 0.2);
      fill.position.set(6, -1.5, 5);
      lit(fill);

      // Decode every picture and stamp before building textures, so each
      // card renders the pair its author actually chose.
      await Promise.all([
        ...ART_OPTIONS.map((o) => preloadPostcardImage(o.src)),
        ...STAMP_OPTIONS.map((o) => preloadPostcardImage(o.src)),
      ]);
      if (disposed || !mount) return;

      const grain = makePaperGrain();
      const edge = new THREE.MeshStandardMaterial({
        color: 0xf2efe6,
        roughness: 0.95,
      });
      const hitMaterial = new THREE.MeshBasicMaterial({ visible: false });

      const geometry = new THREE.BoxGeometry(CARD_W, CARD_H, 0.02);
      const hitGeometry = new THREE.PlaneGeometry(CARD_W, CARD_H);

      // One geometry and one material for every card's shadow. Drawn in
      // the earlier pass, so the card paints over the part it covers and
      // only the offset penumbra shows — no depth test involved, which
      // is what lets a card flip through this plane cleanly.
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

      /* Repeat the source cards up to MIN_STREAM so the arc wraps well
         off screen, and round that up to a whole number of passes
         through the set. Without the rounding the loop length and the
         set length disagree — at nine slots and five cards the loop
         wraps mid-set, so some cards come round twice as often as
         others and the order changes every lap. A whole multiple makes
         the carousel a plain repeating cycle: one, two, three, four,
         five, one, two, and so on, the same every time. */
      const passes = Math.ceil(MIN_STREAM / cards.length);
      const stream = Array.from(
        { length: passes * cards.length },
        (_, i) => cards[i % cards.length]
      );

      /* The sheet between the stream and whatever is being read, sized
         in resize() to cover the frustum at its own depth.

         It rides in the ordinary pass with the stream rather than in a
         pass of its own, and lets depth do the sorting: transparent
         objects draw after opaque ones, so it lands on top of the cards
         at z = 0 without any help. It writes no depth of its own, so it
         never occludes anything — it only tints. The card being read is
         the one thing that must sit over it, and that is handled by
         giving it a later pass, not by fighting this one. */
      const veilMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color("#fbfbfb"),
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const veil = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), veilMaterial);
      veil.position.set(0, 0, VEIL_Z);
      veil.visible = false;
      scene.add(veil);

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
        const mesh = new THREE.Mesh(geometry, [
          edge,
          edge,
          edge,
          edge,
          front,
          back,
        ]);
        // Lean last, flip first. Three's default XYZ order works out to
        // Ry(flip) · Rz(tilt), so a half-turn about Y lands after the lean
        // and mirrors it: the card's up went from (-sin t, cos t) to
        // (+sin t, cos t), leaving a flipped card leaning the opposite way
        // to its own shadow. ZYX gives Rz(tilt) · Ry(flip) instead — the
        // flip happens in the card's own frame and the lean is applied to
        // the result, so the tilt is the same whichever face is showing.
        mesh.rotation.order = "ZYX";
        const hitPlane = new THREE.Mesh(hitGeometry, hitMaterial);
        const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        shadow.layers.set(SHADOW_LAYER);
        const state: CardState = {
          mesh,
          hitPlane,
          shadow,
          baseOffset: i * ANG_SPACING,
          flip: 0,
          targetFlip: 0,
          flipped: false,
          focus: 0,
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
      // The card lifted out of the stream, if any. Held here rather than
      // in React state so the animation loop can read it without a
      // re-render; the boolean mirror below is only for the DOM.
      let focused: CardState | null = null;
      /* 0 in the stream, 1 with a card held up close, and every value
         between while it travels. The veil reads this, so the ground
         fades in step with the card rather than snapping the moment a
         click lands. */
      let focusAmount = 0;
      /* Where the card is being leaned on, eased. Only ever the focused
         card: nothing in the stream is close enough to touch. */
      const press = { x: 0, y: 0 };
      const localHit = new THREE.Vector3();
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
      /* Where the last pick landed, in world space. The press needs the
         point on the card, not just which card it was. */
      let hitPoint: THREE.Vector3 | null = null;
      const pick = () => {
        if (!pointerInside) {
          hitPoint = null;
          return null;
        }
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(states.map((s) => s.hitPlane))[0];
        hitPoint = hit ? hit.point : null;
        return states.find((s) => s.hitPlane === hit?.object) ?? null;
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
        if (focused) {
          // Up close the card behaves like one you are holding: click it
          // to turn it over, click anywhere off it to put it back.
          if (target === focused) focused.flipped = !focused.flipped;
          else release();
          return;
        }
        // Always opens on the artwork, never mid-turn from a previous
        // visit to the same card.
        if (target) {
          target.flipped = false;
          focused = target;
          setFocused(true);
          announce(true);
          setCursorLabel(null);
        }
      };
      const release = () => {
        if (!focused) return;
        focused.flipped = false;
        focused = null;
        setFocused(false);
        announce(false);
      };
      /* The nav listens for this and draws itself up out of the way, so
         a card being read has the whole window to itself. */
      const announce = (on: boolean) =>
        window.dispatchEvent(
          new CustomEvent("hero:focus", { detail: { focused: on } })
        );
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") release();
      };
      window.addEventListener("keydown", onKey);
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
        // What the camera can see at the veil's depth, with room to
        // spare so no edge of it can ever come into frame.
        const reach = camera.position.z - VEIL_Z;
        const visibleH =
          2 * reach * Math.tan((camera.fov * Math.PI) / 360);
        veil.scale.set(visibleH * camera.aspect * 1.4, visibleH * 1.4, 1);
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
          // Up close the card is already the whole subject, so the label
          // stops selling the click and says what the click does.
          setCursorLabel(
            focused
              ? hovered === focused
                ? "Flip"
                : null
              : hovered
                ? "Click me"
                : null
          );
        }

        // Two stages of easing. The exponential approach is frame-rate
        // independent (the old per-frame lerp ran faster on a 120Hz
        // screen), and the smoothstep on top gives the S-curve: the
        // stream leans out of motion and leans back into it instead of
        // decaying straight to a halt.
        const glideTarget = reduced || hovered || focused ? 0 : 1;
        glide += (glideTarget - glide) * (1 - Math.exp(-dt / GLIDE_TAU));
        const eased = glide * glide * (3 - 2 * glide);
        scroll += (reduced ? 0 : BASE_SPEED * eased) * dt;

        /* The card yields where the pointer rests on it: press near an
           edge and that edge goes back, as if you were leaning a finger
           on a sheet of card. The hit point comes back from the same
           raycast the hover already did, converted into the card's own
           space so the sums hold whatever size or angle it is at. */
        let pressToX = 0;
        let pressToY = 0;
        if (focused && hovered === focused && hitPoint) {
          focused.hitPlane.worldToLocal(localHit.copy(hitPoint));
          const u = Math.max(-1, Math.min(1, localHit.x / (CARD_W / 2)));
          const v = Math.max(-1, Math.min(1, localHit.y / (CARD_H / 2)));
          // Push the near edge away: the top going back is a negative
          // turn about X, the right going back a positive one about Y.
          pressToX = -PRESS_MAX * v;
          pressToY = PRESS_MAX * u;
        }
        const pressStep = reduced ? 1 : 1 - Math.exp(-dt / PRESS_TAU);
        press.x += (pressToX - press.x) * pressStep;
        press.y += (pressToY - press.y) * pressStep;

        // Frame-rate independent, and the same curve for the card's
        // travel and the ground's fade, so the two stay in step.
        const focusStep = reduced ? 1 : 1 - Math.exp(-dt / FOCUS_TAU);
        focusAmount += ((focused ? 1 : 0) - focusAmount) * focusStep;
        const veilAmount =
          focusAmount * focusAmount * (3 - 2 * focusAmount);
        veilMaterial.opacity = veilAmount * DIM;
        veil.visible = veilMaterial.opacity > 0.002;

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
          const arcScale = t * t * (3 - 2 * t); // smoothstep
          const onArc = arcScale > 0.01;

          // Ease this card toward or away from the middle of the screen,
          // then read the eased value through a smoothstep so it leaves
          // and arrives without a corner on either end.
          const isFocused = focused === s;
          s.focus += ((isFocused ? 1 : 0) - s.focus) * focusStep;
          const f = s.focus * s.focus * (3 - 2 * s.focus);

          // The focused card paints in its own pass, over the veil.
          // Handed back only once it has fully returned to the stream,
          // or it would drop behind the veil while still travelling.
          if (isFocused) s.mesh.layers.set(FOCUS_LAYER);
          else if (s.focus < 0.01) s.mesh.layers.set(0);

          const x = arcRx * Math.sin(a);
          const y = ARC.cy + ARC.ry * Math.cos(a);
          // lean the card along the path: its bottom edge tracks the
          // ellipse tangent at this angle
          const tilt = Math.atan2(-ARC.ry * Math.sin(a), arcRx * Math.cos(a));

          // Blend between where the arc puts it and where focus wants
          // it. At f = 0 every line below is exactly what it always
          // was — a card in the stream is not moved, resized, or tinted
          // by what some other card is doing. It only ends up behind
          // the veil, which is a thing in front of it rather than a
          // change to it.
          const scale = arcScale * (1 - f) + FOCUS_SCALE * f;
          const px = x * (1 - f);
          const py = y * (1 - f) + FOCUS_Y * f;
          const pz = FOCUS_Z * f;

          // A focused card must not be retired by the angle it happens
          // to sit at, and it has to draw in front of the stream.
          s.mesh.visible = onArc || s.focus > 0.01;
          s.mesh.scale.setScalar(scale);
          s.mesh.position.set(px, py, pz);
          s.mesh.rotation.z = tilt * (1 - f);
          /* The X turn is the innermost of the ZYX order, so it happens
             in the card's own frame — once the card is face-down, the
             same turn tips the top toward the viewer instead of away.
             cos(flip) carries the sign smoothly through the half-turn,
             so pressing the top always sends the top back whichever
             face is showing. */
          s.mesh.rotation.x = f * press.x * Math.cos(s.flip);

          // The hit area follows the card, so the enlarged front is what
          // gets clicked to turn it over.
          s.hitPlane.position.set(px, onArc || s.focus > 0.01 ? py : -100, pz);
          s.hitPlane.rotation.z = tilt * (1 - f);
          s.hitPlane.scale.setScalar(scale);

          // The shadow takes the card's tilt and scale, but its offset
          // stays in world axes rather than the card's own frame: one
          // light source for the whole stream, so the shadow falls the
          // same way on every card however it happens to be leaning.
          // A card held up near the camera is nowhere near the surface
          // its shadow would fall on, so it stops casting one. Faded
          // with the focus rather than switched off, or it would pop.
          s.shadow.visible = (onArc || s.focus > 0.01) && f < 0.99;
          s.shadow.position.set(
            px + SHADOW_OFFSET.x * scale,
            py + SHADOW_OFFSET.y * scale,
            SHADOW_DEPTH + pz
          );
          s.shadow.rotation.z = tilt * (1 - f);

          // A card that has gone around the bend resets, so it doesn't
          // come back around still showing its message.
          if (!onArc && s.flipped && focused !== s) s.flipped = false;

          s.targetFlip = s.flipped ? Math.PI : 0;
          s.flip += (s.targetFlip - s.flip) * (reduced ? 1 : FLIP_EASE);
          // The Y turn sits outside the flip, so it needs no such care.
          s.mesh.rotation.y = s.flip + f * press.y;

          // Turning card, narrowing shadow: what it casts follows the
          // width the card actually presents, so an edge-on card isn't
          // left sitting in front of a full-width rectangle. Floored so
          // the matrix never collapses to zero scale.
          const facing = Math.max(0.08, Math.abs(Math.cos(s.flip)));
          s.shadow.scale.set(scale * facing * (1 - f), scale * (1 - f), 1);
        }

        mount.style.cursor = hovered || focused ? "pointer" : "default";

        // Shadows, then depth wiped, then cards on top. Two passes rather
        // than one sorted scene: transparent objects always draw after
        // opaque ones, so render order alone couldn't put a shadow behind
        // a card it intersects.
        renderer.clear();
        camera.layers.set(SHADOW_LAYER);
        renderer.render(scene, camera);
        renderer.clearDepth();
        camera.layers.set(0);
        renderer.render(scene, camera);
        // The card being read goes over the stream and the veil alike.
        // Clearing depth first is what guarantees it can never be
        // intersected by anything back there, whatever angle it is
        // turned to.
        renderer.clearDepth();
        camera.layers.set(FOCUS_LAYER);
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
        window.removeEventListener("keydown", onKey);
        window.dispatchEvent(
          new CustomEvent("hero:focus", { detail: { focused: false } })
        );
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

      {/* Two things share this band, and never at the same time: the
          statement the stream is for, and — once a card has been picked
          up — the invitation to leave one of your own. Both stay
          mounted and stacked in one grid cell so the swap can be a
          crossfade in place; mounting and unmounting has nothing to
          fade, and a shared cell means neither one moves as it goes. */}
      <div className={styles.overlay}>
        <p
          className={`${styles.tagline} ${styles.band} ${
            focused ? styles.bandOut : styles.bandIn
          }`}
          aria-hidden={focused}
        >
          Designer at the crossroads of systems thinking and high visual craft.
        </p>

        <div
          className={`${styles.focusBar} ${styles.band} ${
            focused ? styles.bandIn : styles.bandOut
          }`}
          aria-hidden={!focused}
        >
          <Link
            href="/postcard"
            className={styles.build}
            tabIndex={focused ? 0 : -1}
          >
            <span>Build your own</span>
            <svg
              viewBox="0 0 52 44"
              width="34"
              height="29"
              className={styles.buildHex}
              aria-hidden="true"
            >
              <path
                d="M16 2 L36 2 L50 22 L36 42 L16 42 L2 22 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M20 28 L32 16 M24 16 L32 16 L32 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <p className={styles.dismiss}>ESC or click the blank space to exit</p>
        </div>
      </div>

      <p
        className={`${styles.corner} ${styles.cornerLeft} ${
          focused ? styles.cornerHidden : ""
        }`}
      >
        Currently designing at Loop Financial
      </p>
      <p
        className={`${styles.corner} ${styles.cornerRight} ${
          focused ? styles.cornerHidden : ""
        }`}
      >
        Studying UX and AI at the University of Michigan
      </p>
    </section>
  );
}
