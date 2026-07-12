"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ChatPanel.module.css";

type Message = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "What did Rebecca build at Loop?",
  "How does she split design and engineering?",
  "What is she looking for next?",
];

/**
 * Slide-over chat grounded in Rebecca's work. Opens via the nav's
 * "Ask about my work" button (a window "chat:open" event). All model
 * calls go through /api/chat so no key ever reaches the browser.
 */
export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("chat:open", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("chat:open", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, busy]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const next: Message[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "Something went wrong on my end. Try again in a moment, or email Rebecca directly.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {open && (
        <div
          className={styles.scrim}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`${styles.panel} ${open ? styles.open : ""}`}
        aria-hidden={!open}
        aria-label="Ask about Rebecca's work"
      >
        <header className={styles.head}>
          <div>
            <h2 className={`serif ${styles.title}`}>Ask about my work</h2>
            <p className={styles.hint}>
              Answers are grounded in the case studies on this site.
            </p>
          </div>
          <button
            className={styles.close}
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            ×
          </button>
        </header>

        <div className={styles.list} ref={listRef}>
          {messages.length === 0 && (
            <div className={styles.starters}>
              {STARTERS.map((s) => (
                <button
                  key={s}
                  className={styles.starter}
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? styles.user : styles.assistant}
            >
              {m.content}
            </div>
          ))}
          {busy && <div className={styles.assistant}>Thinking…</div>}
        </div>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a project, a decision, a role"
            aria-label="Your question"
          />
          <button className={styles.send} disabled={busy || !input.trim()}>
            Send
          </button>
        </form>
      </aside>
    </>
  );
}
