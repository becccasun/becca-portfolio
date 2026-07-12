"use client";

import { useState } from "react";
import {
  ICONS,
  PAPER_COLORS,
  type BottleMessage,
  type IconId,
  type PaperColor,
} from "@/lib/bottle-client";
import styles from "./BottleHero.module.css";

type Mode = "idle" | "reading" | "composing" | "sent";

const WAVE = "~ ".repeat(240);

/**
 * Full-viewport interactive hero: a glass bottle drifts on an ASCII
 * sea. Opening it reveals the note the previous visitor left (or
 * Rebecca's preset); you can write one back on a pastel paper with an
 * ASCII signature icon, or browse the catalogue of past notes.
 */
export default function BottleHero() {
  const [mode, setMode] = useState<Mode>("idle");
  const [current, setCurrent] = useState<BottleMessage | null>(null);
  const [catalogue, setCatalogue] = useState<BottleMessage[] | null>(null);
  const [showCatalogue, setShowCatalogue] = useState(false);
  const [busy, setBusy] = useState(false);

  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState<PaperColor>("cream");
  const [icon, setIcon] = useState<IconId>("flower");

  const colorHex = (id: PaperColor) =>
    PAPER_COLORS.find((c) => c.id === id)?.hex ?? "#FAF3E3";

  async function openBottle() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/bottle");
      const data = await res.json();
      setCurrent(data.message);
    } catch {
      setCurrent(null);
    } finally {
      setBusy(false);
      setMode("reading");
    }
  }

  async function openCatalogue() {
    setShowCatalogue(true);
    try {
      const res = await fetch("/api/bottle?list=1");
      const data = await res.json();
      setCatalogue(data.messages ?? []);
    } catch {
      setCatalogue([]);
    }
  }

  async function send() {
    if (busy || text.trim().length < 2) return;
    setBusy(true);
    try {
      await fetch("/api/bottle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, name, color, icon }),
      });
      setText("");
      setName("");
      setMode("sent");
    } catch {
      setMode("sent");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.hero} aria-label="Message in a bottle">
      {/* sea */}
      <div className={styles.sea} aria-hidden="true">
        <pre className={`${styles.wave} ${styles.wave1}`}>{WAVE}</pre>
        <pre className={`${styles.wave} ${styles.wave2}`}>{WAVE}</pre>
        <pre className={`${styles.wave} ${styles.wave3}`}>{WAVE}</pre>
      </div>

      {/* the bottle */}
      {mode === "idle" && (
        <button
          className={styles.bottle}
          onClick={openBottle}
          data-cursor-label="Open"
          aria-label="Open the bottle"
        >
          <BottleArt />
        </button>
      )}

      <p className={styles.hint} aria-hidden={mode !== "idle"}>
        {mode === "idle"
          ? "A bottle drifts by. Someone left you a note."
          : " "}
      </p>

      {/* paper overlay */}
      {mode !== "idle" && (
        <div className={styles.scrim}>
          <div
            className={styles.paper}
            style={{
              background: colorHex(
                mode === "reading" ? current?.color ?? "cream" : color
              ),
            }}
          >
            <button
              className={styles.close}
              onClick={() => setMode("idle")}
              aria-label="Close"
            >
              ×
            </button>

            {mode === "reading" && (
              <>
                <pre className={styles.icon}>
                  {ICONS[current?.icon ?? "flower"]}
                </pre>
                <p className={`serif ${styles.note}`}>
                  {current?.text ?? "The paper is soggy. Try again in a bit."}
                </p>
                <p className={styles.signature}>
                  — {current?.name || "anonymous"}
                </p>
                <div className={styles.actions}>
                  <button
                    className={styles.primary}
                    onClick={() => setMode("composing")}
                  >
                    Write one back
                  </button>
                  <button className={styles.secondary} onClick={openCatalogue}>
                    Past notes
                  </button>
                </div>
              </>
            )}

            {mode === "composing" && (
              <>
                <textarea
                  className={`serif ${styles.textarea}`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={280}
                  rows={4}
                  placeholder="Leave something kind for the next person who opens this…"
                  aria-label="Your note"
                />
                <div className={styles.signRow}>
                  <span className={styles.dash}>—</span>
                  <input
                    className={styles.nameInput}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={24}
                    placeholder="initials or first name, or leave blank"
                    aria-label="Signature (optional)"
                  />
                </div>

                <div className={styles.pickers}>
                  <div
                    className={styles.swatches}
                    role="radiogroup"
                    aria-label="Paper color"
                  >
                    {PAPER_COLORS.map((c) => (
                      <button
                        key={c.id}
                        role="radio"
                        aria-checked={color === c.id}
                        aria-label={c.id}
                        className={`${styles.swatch} ${
                          color === c.id ? styles.swatchActive : ""
                        }`}
                        style={{ background: c.hex }}
                        onClick={() => setColor(c.id)}
                      />
                    ))}
                  </div>
                  <div
                    className={styles.iconPicker}
                    role="radiogroup"
                    aria-label="Signature icon"
                  >
                    {(Object.keys(ICONS) as IconId[]).map((id) => (
                      <button
                        key={id}
                        role="radio"
                        aria-checked={icon === id}
                        aria-label={id}
                        className={`${styles.iconOption} ${
                          icon === id ? styles.iconActive : ""
                        }`}
                        onClick={() => setIcon(id)}
                      >
                        <pre>{ICONS[id]}</pre>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.primary}
                    onClick={send}
                    disabled={busy || text.trim().length < 2}
                  >
                    {busy ? "Corking…" : "Send it to sea"}
                  </button>
                  <span className={styles.count}>{text.length}/280</span>
                </div>
              </>
            )}

            {mode === "sent" && (
              <>
                <pre className={styles.icon}>{ICONS[icon]}</pre>
                <p className={`serif ${styles.note}`}>
                  Corked and back at sea. The next person to open the bottle
                  will find your note.
                </p>
                <div className={styles.actions}>
                  <button
                    className={styles.primary}
                    onClick={() => setMode("idle")}
                  >
                    Watch it drift away
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* catalogue */}
      {showCatalogue && (
        <div className={styles.scrim}>
          <div className={styles.catalogue}>
            <div className={styles.catalogueHead}>
              <h2 className={`serif ${styles.catalogueTitle}`}>
                Notes that came before
              </h2>
              <button
                className={styles.close}
                onClick={() => setShowCatalogue(false)}
                aria-label="Close past notes"
              >
                ×
              </button>
            </div>
            <div className={styles.catalogueGrid}>
              {catalogue === null && <p className={styles.empty}>Fishing…</p>}
              {catalogue?.length === 0 && (
                <p className={styles.empty}>
                  The sea is quiet so far. Yours could be the first.
                </p>
              )}
              {catalogue?.map((m) => (
                <div
                  key={m.id}
                  className={styles.miniPaper}
                  style={{ background: colorHex(m.color) }}
                >
                  <pre className={styles.miniIcon}>{ICONS[m.icon]}</pre>
                  <p className={styles.miniText}>{m.text}</p>
                  <p className={styles.miniName}>— {m.name || "anonymous"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function BottleArt() {
  return (
    <svg
      viewBox="0 0 120 210"
      width="120"
      height="210"
      className={styles.bottleSvg}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#DDE9FB" stopOpacity="0.9" />
          <stop offset="0.45" stopColor="#EFF5FE" stopOpacity="0.6" />
          <stop offset="1" stopColor="#C9DCF9" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* cork */}
      <rect x="45" y="2" width="30" height="20" rx="5" fill="#C29A6B" />
      {/* neck */}
      <rect x="48" y="18" width="24" height="40" fill="url(#glass)" stroke="#9FC0F0" />
      {/* body */}
      <rect x="26" y="52" width="68" height="148" rx="28" fill="url(#glass)" stroke="#9FC0F0" />
      {/* rolled note inside */}
      <g transform="rotate(-14 60 135)">
        <rect x="38" y="122" width="44" height="26" rx="12" fill="#FAF3E3" stroke="#E2D6B8" />
        <line x1="46" y1="130" x2="74" y2="130" stroke="#D8C9A5" strokeWidth="2" />
        <line x1="46" y1="138" x2="70" y2="138" stroke="#D8C9A5" strokeWidth="2" />
      </g>
      {/* glass highlight */}
      <rect x="36" y="64" width="7" height="120" rx="3.5" fill="#FFFFFF" opacity="0.55" />
    </svg>
  );
}
