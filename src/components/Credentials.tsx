"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { heroBand } from "@/content";
import { withBase } from "@/lib/base";
import s from "./Credentials.module.css";

// The hero's old credits band, folded into the header: the logos sit as a small stacked
// deck right of the page links. Hovering (or focusing, or tapping) deals the deck out:
// each logo drops straight down from the stack to the start of its own row in a
// dropdown, and the row's text and years fade in beside it. The logos are the same
// elements in both states, so the unstacking is one continuous move.
export default function Credentials() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  // a short grace period so moving the pointer from the deck down into the list doesn't close it
  const hide = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  // The dropdown hangs from the deck's left edge (so the logos fall straight down) and
  // reaches right, away from the page centre. If that would run off a narrow window it
  // slides left just enough to fit; --px carries the shift to the panel and the logos.
  const panel = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const place = () => {
      const deck = button.current?.getBoundingClientRect();
      const w = panel.current?.offsetWidth;
      if (!deck || !w || !wrap.current) return;
      const px = Math.min(-18, window.innerWidth - 16 - deck.left - w);
      wrap.current.style.setProperty("--px", `${px}px`);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
    // re-measured on every open: the deck can shift once the web font loads
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    // a tap elsewhere closes it (touch screens have no hover-out)
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div
      ref={wrap}
      className={s.wrap}
      data-open={open || undefined}
      style={{ "--n": heroBand.roles.length } as React.CSSProperties}
      onPointerEnter={(e) => e.pointerType === "mouse" && show()}
      onPointerLeave={(e) => e.pointerType === "mouse" && hide()}
      onFocus={show}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && hide()}
    >
      <button
        ref={button}
        type="button"
        className={s.deck}
        aria-expanded={open}
        aria-controls="credentials"
        aria-label="Where I am now"
        onClick={() => setOpen((o) => !o)}
      >
        {heroBand.roles.map((r, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={r.text} src={withBase(r.logo)} alt="" className={s.chip} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </button>
      <div ref={panel} id="credentials" className={s.panel} aria-hidden={!open}>
        <ul>
          {heroBand.roles.map((r, i) => (
            <li key={r.text} style={{ "--i": i } as React.CSSProperties}>
              <span>{r.text}</span>
              {"yc" in r && r.yc && <span className={s.yc} title="Backed by Y Combinator" aria-label="Backed by Y Combinator">Y</span>}
              <span className={s.years}>{r.years}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
