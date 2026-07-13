"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BG_OPTIONS,
  FG_OPTIONS,
  DECO_OPTIONS,
  drawPostcardFront,
  drawPostcardBack,
  type BgId,
  type FgId,
  type DecoId,
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

function Thumb({ design }: { design: PostcardDesign }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (ctx) drawPostcardFront(ctx, 144, 96, design);
  }, [design]);
  return <canvas ref={ref} width={144} height={96} className={styles.thumb} />;
}

/**
 * "Leave your own postcard": the front is assembled from preset
 * components (background, foreground, decoration) — a predictable
 * formula the visitor still owns their combination of — and the back
 * carries their message, signed or anonymous. Approved cards join the
 * stream on the home hero.
 */
export default function PostcardComposer() {
  const [bg, setBg] = useState<BgId>("shore");
  const [fg, setFg] = useState<FgId>("bloom");
  const [deco, setDeco] = useState<DecoId>("stamp");
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [side, setSide] = useState<"front" | "back">("front");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const design: PostcardDesign = { bg, fg, deco };

  async function send() {
    if (busy || text.trim().length < 2) return;
    setBusy(true);
    try {
      await fetch("/api/postcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, name, design }),
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
          Compose the front, write the back. It joins the stream for the next
          visitor to find.
        </p>
      </header>

      <div className={styles.layout}>
        <div className={styles.preview}>
          <div className={styles.previewFrame}>
            {side === "front" ? (
              <PreviewCanvas
                key={`f-${bg}-${fg}-${deco}`}
                draw={(ctx, w, h) => drawPostcardFront(ctx, w, h, design)}
              />
            ) : (
              <PreviewCanvas
                key={`b-${text}-${name}`}
                draw={(ctx, w, h) => drawPostcardBack(ctx, w, h, text, name)}
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
            <legend className={styles.legend}>Background</legend>
            <div className={styles.options}>
              {BG_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  className={`${styles.option} ${
                    bg === o.id ? styles.optionActive : ""
                  }`}
                  onClick={() => {
                    setBg(o.id);
                    setSide("front");
                  }}
                  aria-pressed={bg === o.id}
                >
                  <Thumb design={{ bg: o.id, fg, deco }} />
                  <span>{o.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>Foreground</legend>
            <div className={styles.options}>
              {FG_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  className={`${styles.option} ${
                    fg === o.id ? styles.optionActive : ""
                  }`}
                  onClick={() => {
                    setFg(o.id);
                    setSide("front");
                  }}
                  aria-pressed={fg === o.id}
                >
                  <Thumb design={{ bg, fg: o.id, deco }} />
                  <span>{o.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>Decoration</legend>
            <div className={styles.options}>
              {DECO_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  className={`${styles.option} ${
                    deco === o.id ? styles.optionActive : ""
                  }`}
                  onClick={() => {
                    setDeco(o.id);
                    setSide("front");
                  }}
                  aria-pressed={deco === o.id}
                >
                  <Thumb design={{ bg, fg, deco: o.id }} />
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
              placeholder="Something kind for the next visitor…"
              aria-label="Postcard message"
            />
            <input
              className={styles.nameInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setSide("back")}
              maxLength={24}
              placeholder="Initials or first name (optional, blank = anonymous)"
              aria-label="Signature (optional)"
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
