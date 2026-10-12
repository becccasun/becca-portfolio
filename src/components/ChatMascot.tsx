"use client";
import { useEffect, useState } from "react";
import { EyeTracker } from "./EyeTracker";
import s from "./ChatMascot.module.css";

// The mascot that opens and closes the site's chat (see Chat.tsx). The full-viewport
// frame is what EyeTracker measures its reach against (`.mascot-frame`), so the eyes
// follow the cursor anywhere on the page; it ignores pointer events so nothing
// underneath is blocked.
//   expanded — the chat (bar or answers) is open: the mascot turns from grey to black
//   cue   — bump it when the chat closes: a small hop, so people see where it went
//   pulse — bump it when a reply lands: a small nod
export default function ChatMascot({
  onToggle,
  expanded = false,
  cue = 0,
  pulse = 0,
}: {
  onToggle?: () => void;
  expanded?: boolean;
  cue?: number;
  pulse?: number;
}) {
  const [cueing, setCueing] = useState(false);
  const [nodding, setNodding] = useState(false);

  useEffect(() => {
    if (!cue) return;
    setCueing(true);
    const t = window.setTimeout(() => setCueing(false), 2400);
    return () => window.clearTimeout(t);
  }, [cue]);

  useEffect(() => {
    if (!pulse) return;
    setNodding(true);
    const t = window.setTimeout(() => setNodding(false), 600);
    return () => window.clearTimeout(t);
  }, [pulse]);

  return (
    <div className={`mascot-frame ${s.frame}`}>
      <button
        type="button"
        className={s.button}
        aria-label={expanded ? "Close the chat" : "Ask about Rebecca"}
        aria-expanded={expanded}
        onClick={onToggle}
        data-mascot
        data-open={expanded || undefined}
        data-cue={cueing || undefined}
        data-nod={nodding || undefined}
      >
        <EyeTracker size={44} shape="Cube" eyes="Slant" eyeScale={1.25} follow={45} bounce={35} />
      </button>
    </div>
  );
}
