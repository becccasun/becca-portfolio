"use client";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Link from "next/link";
import { works } from "@/content";
import ChatMascot from "./ChatMascot";
import dynamic from "next/dynamic";
// The bar (and the liquid-gooey library under it) only loads the first time someone
// opens the chat, not with the page.
const CommandBar = dynamic(() => import("./CommandBar").then((m) => m.CommandBar), { ssr: false });
import s from "./Chat.module.css";
import { STATIC_EXPORT, withBase } from "@/lib/base";

/*
  The mascot's chat.
    · The mascot (bottom right) opens and closes it; so does the X in the bar, and Esc.
    · The bar sits at the bottom centre over a frosted, progressive blur.
    · The conversation stacks up from the mascot: questions as small chips, replies as
      speech bubbles pointing down at it. Newest at the bottom; older ones scroll up and
      fade out at the top.
  Answers come from /api/chat, which only knows what's in src/knowledge. The model ends an
  answer with tags like [[embedder]]; those become project rows in the bubble, and any tag
  that isn't a real project is dropped.
*/


const STARTERS = [
  "What is Rebecca good at?",
  "Show me her design systems work",
  "Has she built anything with AI?",
  "How can I reach her?",
];

// Four layers, each stronger and nearer the bottom edge: the header's progressive blur, mirrored.
const FROST = [
  { blur: 2, from: 100 },
  { blur: 5, from: 75 },
  { blur: 10, from: 50 },
  { blur: 18, from: 28 },
];

// The stack scrolls, so it can hold a long conversation; this only bounds the DOM.
const SHOWN = 40;

// what counts as a control rather than blank space, for click-outside-to-close
const INTERACTIVE =
  'a, button, input, textarea, select, label, summary, video, iframe, [contenteditable], [role="button"], [role="tab"], [role="separator"], [role="slider"]';

type Msg = { id: number; role: "user" | "assistant"; content: string; error?: boolean };

// The chat's knowledge comes from the older portfolio, so its project tags use that site's
// slugs. Each maps to the case study here that covers it; tags with no page here get no card.
const PAGE_FOR_TAG: Record<string, string> = {
  "loop-onboarding": "loop-onboarding",
  embedder: "feature-discovery",
  loop: "design-mcp",
  "loop-design-system": "design-mcp",
  "loop-design-agent": "design-mcp",
  mhacks: "mhacks",
  agentmail: "agentmail",
};
const BY_SLUG = new Map(works.filter((w) => !w.comingSoon).map((w) => [w.slug, w]));
const TAG = /\[\[([a-z0-9-]+)\]\]/g;

/** The answer's prose, without its card tags (or a tag still arriving mid-stream). */
// Em dashes are banned in the briefing, but the case-study material has some, so any
// that slip through become a comma here.
const prose = (raw: string) =>
  raw.replace(TAG, "").replace(/\[\[[a-z0-9-]*\]?$/, "").replace(/\s*\u2014\s*/g, ", ").trim();

/** One block of a reply: a paragraph, or a list when every line starts with "- " (or "• "). */
const Block = ({ text }: { text: string }) => {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const bullet = /^[-•*]\s+/;
  if (lines.length > 0 && lines.every((l) => bullet.test(l))) {
    return <ul>{lines.map((l, i) => <li key={i}>{l.replace(bullet, "")}</li>)}</ul>;
  }
  return <p>{text}</p>;
};

/** "PRODUCT DESIGN INTERN · SUMMER 2026" → "Product Design Intern · Summer 2026" */
const titleCase = (t: string) => t.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

/** Real projects the answer tagged, in order, at most three. */
const cardsFor = (raw: string) => {
  const seen = new Set<string>();
  for (const m of raw.matchAll(TAG)) {
    const page = PAGE_FOR_TAG[m[1]];
    if (page && BY_SLUG.has(page)) seen.add(page);
  }
  return [...seen].slice(0, 3).map((slug) => BY_SLUG.get(slug)!);
};

/** The history the API accepts: alternating turns starting with a question, at most 19 and
    8,000 characters in all (the oldest go first). A question that only got an error back is
    dropped with its error, so turns still alternate. */
function forApi(history: Msg[]) {
  const turns = history
    .filter((m, i) => !m.error && !(m.role === "user" && history[i + 1]?.error))
    .map(({ role, content }) => ({ role, content }));
  let start = Math.max(0, turns.length - 19);
  const size = (from: number) => turns.slice(from).reduce((n, t) => n + t.content.length, 0);
  while (start < turns.length - 1 && (turns[start].role !== "user" || size(start) > 8000)) start++;
  return turns.slice(start);
}

let nextId = 1;

export default function Chat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [barW, setBarW] = useState(440);
  const [cue, setCue] = useState(0);
  const [pulse, setPulse] = useState(0);
  const abort = useRef<AbortController | null>(null);
  const items = useRef(new Map<number, HTMLElement>());
  const tops = useRef(new Map<number, number>());

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    // on phones the bar leaves room on both sides for the mascot in the bottom-right corner
    const fit = () => setBarW(Math.min(440, window.innerWidth - (window.innerWidth < 640 ? 152 : 32)));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setCue((c) => c + 1); // show where the chat went
  }, []);
  const toggle = () => (open ? close() : setOpen(true));

  // A stamp opening takes over the screen, so the chat steps aside (StampRow flags the
  // page with html[data-stamp="open"]). No cue here: the mascot is behind the stamp's blur.
  // The phone menu (html[data-menu="open"]) covers the page the same way.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const mo = new MutationObserver(() => {
      if (html.dataset.stamp === "open" || html.dataset.menu === "open") setOpen(false);
    });
    mo.observe(html, { attributes: true, attributeFilter: ["data-stamp", "data-menu"] });
    return () => mo.disconnect();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // A click on blank page space closes the chat. Clicks on the chat itself, the mascot,
  // or anything interactive (a link, a stamp, a video) leave it open, and so does the
  // click that ends a text selection.
  const chatEl = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t || chatEl.current?.contains(t) || t.closest(`[data-mascot], ${INTERACTIVE}`)) return;
      if (!(window.getSelection()?.isCollapsed ?? true)) return;
      close();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open, close]);

  // The stack follows the newest message unless the visitor has scrolled up to reread.
  const log = useRef<HTMLOListElement>(null);
  const stick = useRef(true);
  const toBottom = () => {
    const el = log.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  };

  // ── older messages slide up rather than jump (FLIP), only when a message is added ──
  const count = messages.length;
  useLayoutEffect(() => {
    toBottom(); // settle the scroll first, so the measured "after" positions are final
    const moved: HTMLElement[] = [];
    items.current.forEach((el, id) => {
      const before = tops.current.get(id);
      const now = el.getBoundingClientRect().top;
      if (before !== undefined && Math.abs(before - now) > 0.5) {
        el.style.transition = "none";
        el.style.transform = `translateY(${before - now}px)`;
        moved.push(el);
      }
      tops.current.set(id, now);
    });
    if (moved.length) {
      void document.body.offsetHeight; // commit the inverted positions before releasing them
      for (const el of moved) {
        el.style.transition = "";
        el.style.transform = "";
      }
    }
  }, [count]);
  // a streaming reply grows the stack: stay pinned to it, and keep the FLIP record current
  useEffect(() => {
    toBottom();
    items.current.forEach((el, id) => tops.current.set(id, el.getBoundingClientRect().top));
  });

  const send = async (text: string) => {
    if (busy) return;
    const question: Msg = { id: nextId++, role: "user", content: text };
    const reply: Msg = { id: nextId++, role: "assistant", content: "" };
    const history = [...messages, question];
    stick.current = true; // asking a question always brings you back to the newest message
    setMessages([...history, reply]);
    setBusy(true);

    const ctrl = new AbortController();
    abort.current = ctrl;
    const write = (content: string, error = false) =>
      setMessages((m) => m.map((x) => (x.id === reply.id ? { ...x, content, error } : x)));

    if (STATIC_EXPORT) {
      // This copy of the site is static files only (GitHub Pages), so there's no server to answer.
      write("The chat needs a server, so it's switched off on this copy of the site. You can reach me at beccasun@umich.edu.", true);
      setBusy(false);
      abort.current = null;
      return;
    }
    try {
      const res = await fetch(withBase("/api/chat"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: forApi(history) }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => null);
        write(err?.error ?? "Something went wrong. Could you try again?", true);
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        write(acc);
      }
      if (!acc.trim()) write("Something went wrong. Could you try again?", true);
    } catch (e) {
      if ((e as Error).name !== "AbortError") write("I couldn't reach the server. Check your connection and try again.", true);
    } finally {
      setBusy(false);
      abort.current = null;
      setPulse((p) => p + 1); // the mascot nods as its reply lands
    }
  };

  useEffect(() => () => abort.current?.abort(), []);

  // The bar's Enter: while a reply is still arriving the question waits in the field
  // instead of being cleared and dropped.
  const submit = (text: string) => {
    if (busy) return false;
    void send(text);
  };

  // oldest first: the newest message sits at the bottom, right above the mascot
  const shown = messages.slice(-SHOWN);
  const started = messages.length > 0;

  return (
    <>
      <ChatMascot onToggle={toggle} expanded={open} cue={cue} pulse={pulse} />
      {mounted &&
        createPortal(
          <>
            {/* frosted, progressive blur behind the bar — its own layer, under the mascot */}
            <div className={s.frost} data-open={open || undefined} aria-hidden>
              {FROST.map((l) => {
                const mask = `linear-gradient(to top, #000 0%, #000 ${l.from * 0.45}%, transparent ${l.from}%)`;
                return (
                  <div
                    key={l.blur}
                    style={{
                      backdropFilter: `blur(${l.blur}px)`,
                      WebkitBackdropFilter: `blur(${l.blur}px)`,
                      maskImage: mask,
                      WebkitMaskImage: mask,
                    }}
                  />
                );
              })}
              <div className={s.frostWash} />
            </div>

          <div ref={chatEl} className={s.chat} data-open={open || undefined}>
            {/* the conversation, stacked up from the mascot */}
            <ol
              ref={log}
              className={s.stack}
              aria-live="polite"
              aria-label="Conversation"
              onScroll={(e) => {
                const el = e.currentTarget;
                stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
              }}
            >
              {shown.map((m) => (
                <li
                  key={m.id}
                  ref={(el) => {
                    if (el) items.current.set(m.id, el);
                    else {
                      items.current.delete(m.id);
                      tops.current.delete(m.id);
                    }
                  }}
                  className={m.role === "user" ? s.chip : s.bubble}
                  data-error={m.error || undefined}
                >
                  {m.role === "user" ? (
                    m.content
                  ) : m.content ? (
                    <>
                      {prose(m.content)
                        .split(/\n{2,}/)
                        .map((para, j) => (
                          <Block key={j} text={para} />
                        ))}
                      {!m.error && cardsFor(m.content).length > 0 && (
                        <span className={s.cards}>
                          {cardsFor(m.content).map((p) => (
                            <Link key={p.slug} className={s.card} href={`/work/${p.slug}`}>
                              <span className={s.cover} style={p.image ? { backgroundImage: `url(${withBase(p.image)})` } : undefined} />
                              <span className={s.cardText}>
                                <b>{p.title}</b>
                                <span>{p.kicker && titleCase(p.kicker.replace(" \u2022 ", " · "))}</span>
                              </span>
                              <span className={s.go} aria-hidden>→</span>
                            </Link>
                          ))}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className={s.dots} aria-label="Thinking">
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                </li>
              ))}
            </ol>

            {/* the bar */}
            <div className={s.dock} aria-hidden={!open}>
              <div className={s.starters} data-gone={started || undefined}>
                {STARTERS.map((q) => (
                  <button key={q} type="button" className={s.starter} onClick={() => send(q)} tabIndex={open && !started ? 0 : -1}>
                    {q}
                  </button>
                ))}
              </div>
              {open && (
                <CommandBar
                  width={barW}
                  placeholder={busy ? "Answering…" : started ? "Ask a follow-up..." : "Ask about Rebecca..."}
                  label="Ask a question about Rebecca"
                  autoFocus
                  onSubmit={submit}
                  leading={
                    <button type="button" className={s.x} onClick={close} aria-label="Close the chat">
                      <X size={17} strokeWidth={2.2} />
                    </button>
                  }
                />
              )}
            </div>
          </div>
          </>,
          document.body,
        )}
    </>
  );
}
