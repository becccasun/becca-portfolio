"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import s from "./ComingSoonCard.module.css";

// A work card that isn't ready yet. No link; over it, the cursor stretches out into a
// "Coming soon" pill that follows the pointer.
export default function ComingSoonCard({ className, children }: { className?: string; children: React.ReactNode }) {
  const pill = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    pill.current?.style.setProperty("translate", `${e.clientX}px ${e.clientY}px`);
  };

  return (
    <div
      className={`${className ?? ""} ${s.card}`}
      onPointerEnter={(e) => { move(e); if (e.pointerType === "mouse") setOn(true); }}
      onPointerMove={move}
      onPointerLeave={() => setOn(false)}
      aria-label="Coming soon"
    >
      {children}
      {/* Portalled to <body> so the sheet's and the reveal's transforms can't offset a fixed element */}
      {mounted && createPortal(
        <span ref={pill} className={`${s.pill} ${on ? s.on : ""}`} aria-hidden>
          <span className={s.label}>Coming soon</span>
        </span>,
        document.body,
      )}
    </div>
  );
}
