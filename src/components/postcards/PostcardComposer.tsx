"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ART_OPTIONS,
  STAMP_OPTIONS,
  artSrc,
  stampSrc,
  drawPostcardFront,
  drawPostcardBack,
  preloadPostcardImage,
  readyImage,
  type ArtId,
  type StampId,
  type PostcardDesign,
} from "@/lib/postcards-client";
import styles from "./PostcardComposer.module.css";

const PREVIEW_W = 768;
const PREVIEW_H = 512;

function PreviewCanvas({
  draw,
}: {
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (ctx) draw(ctx, PREVIEW_W, PREVIEW_H);
  }, [draw]);
  return (
    <canvas
      ref={ref}
      width={PREVIEW_W}
      height={PREVIEW_H}
      className={styles.previewCanvas}
    />
  );
}

/**
 * "Leave your own postcard": pick the picture for the front and the
 * stamp for the back, then write the message. Approved cards join the
 * stream on the home hero.
 */
export default function PostcardComposer() {
  const [art, setArt] = useState<ArtId>("water");
  const [stamp, setStamp] = useState<StampId>("bamboo");
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState("");
  const [side, setSide] = useState<"front" | "back">("front");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  // Bumped once every image is decoded, so the canvases redraw with
  // artwork instead of blank stock on first paint.
  const [loaded, setLoaded] = useState(0);

  const design: PostcardDesign = { art, stamp };

  useEffect(() => {
    let live = true;
    Promise.all([
      ...ART_OPTIONS.map((o) => preloadPostcardImage(o.src)),
      ...STAMP_OPTIONS.map((o) => preloadPostcardImage(o.src)),
    ]).then(() => {
      if (live) setLoaded((n) => n + 1);
    });
    return () => {
      live = false;
    };
  }, []);

  async function send() {
    if (busy || text.trim().length < 2) return;
    setBusy(true);
    try {
      await fetch("/api/postcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, name, city, role, design }),
      });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.sentWrap}>
          <PreviewCanvas
            draw={(ctx, w, h) => drawPostcardFront(ctx, w, h, design)}
          />
          <h1 className={`serif ${styles.title}`}>It&apos;s in the mail.</h1>
          <p className={styles.sub}>
            Your postcard is headed for the stream on the front page.
          </p>
          <Link href="/" className={styles.cta}>
            Watch the stream
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1 className={`serif ${styles.title}`}>Leave your own postcard</h1>
        <p className={styles.sub}>
          Pick the picture and the stamp, write the back. It joins the stream
          for the next visitor to find.
        </p>
      </header>

      <div className={styles.layout}>
        <div className={styles.preview}>
          <div className={styles.previewFrame}>
            {side === "front" ? (
              <PreviewCanvas
                key={`f-${art}-${loaded}`}
                draw={(ctx, w, h) => drawPostcardFront(ctx, w, h, design)}
              />
            ) : (
              <PreviewCanvas
                key={`b-${stamp}-${text}-${name}-${city}-${role}-${loaded}`}
                draw={(ctx, w, h) =>
                  drawPostcardBack(
                    ctx,
                    w,
                    h,
                    text,
                    { name, city, role },
                    readyImage(stampSrc(stamp))
                  )
                }
              />
            )}
          </div>
          <div className={styles.sideToggle}>
            <button
              className={side === "front" ? styles.sideActive : ""}
              onClick={() => setSide("front")}
            >
              Front
            </button>
            <button
              className={side === "back" ? styles.sideActive : ""}
              onClick={() => setSide("back")}
            >
              Back
            </button>
          </div>
        </div>

        <div className={styles.controls}>
          <fieldset className={styles.group}>
            <legend className={styles.legend}>Postcard</legend>
            <div className={styles.options}>
              {ART_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  className={`${styles.option} ${
                    art === o.id ? styles.optionActive : ""
                  }`}
                  onClick={() => {
                    setArt(o.id);
                    setSide("front");
                  }}
                  aria-pressed={art === o.id}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={artSrc(o.id)} alt="" className={styles.thumb} />
                  <span>{o.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>Stamp</legend>
            <div className={styles.options}>
              {STAMP_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  className={`${styles.option} ${
                    stamp === o.id ? styles.optionActive : ""
                  }`}
                  onClick={() => {
                    setStamp(o.id);
                    setSide("back");
                  }}
                  aria-pressed={stamp === o.id}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={stampSrc(o.id)}
                    alt=""
                    className={styles.stampThumb}
                  />
                  <span>{o.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>Message</legend>
            <textarea
              className={styles.textarea}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setSide("back");
              }}
              onFocus={() => setSide("back")}
              maxLength={240}
              rows={3}
              placeholder="What are you currently working on?"
              aria-label="Postcard message"
            />
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>Sender</legend>
            <p className={styles.hint}>
              All optional. Leave the first line blank to stay anonymous.
            </p>
            <input
              className={styles.nameInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setSide("back")}
              maxLength={24}
              placeholder="First name, initials, or alias"
              aria-label="Name (optional)"
            />
            <input
              className={styles.nameInput}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onFocus={() => setSide("back")}
              maxLength={32}
              placeholder="City"
              aria-label="City (optional)"
            />
            <input
              className={styles.nameInput}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onFocus={() => setSide("back")}
              maxLength={32}
              placeholder="Role (student, designer, developer…)"
              aria-label="Role (optional)"
            />
          </fieldset>

          <div className={styles.sendRow}>
            <button
              className={styles.cta}
              onClick={send}
              disabled={busy || text.trim().length < 2}
            >
              {busy ? "Sending…" : "Send it into the stream"}
            </button>
            <span className={styles.count}>{text.length}/240</span>
          </div>
        </div>
      </div>
    </div>
  );
}
