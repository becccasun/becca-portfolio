"use client";
import { useEffect, useState } from "react";
import { fetchNotes, NAME_MAX, NOTE_MAX, notesReady, sendNote, type Note } from "@/lib/notes";
import s from "./Notes.module.css";

// A slip's lean, steady per note so the board doesn't reshuffle on every load
function tilt(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 25) - 12) / 10; // -1.2deg to 1.2deg
}

function Slip({ n }: { n: Note }) {
  return (
    <figure className={s.slip} data-mine={n.from_rebecca || undefined} style={{ rotate: `${tilt(n.id)}deg` }}>
      <blockquote>{n.body}</blockquote>
      <figcaption>{n.from_rebecca ? "Rebecca" : n.name || "Anonymous"}</figcaption>
    </figure>
  );
}

// One form, two fields, one button. Notes wait for Rebecca's approval before they show.
function Compose() {
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const left = NOTE_MAX - body.length;

  return (
    <form
      className={s.compose}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!body.trim() || state === "sending") return;
        setState("sending");
        try {
          await sendNote(body, name);
          setBody("");
          setState("sent");
        } catch {
          setState("error");
        }
      }}
    >
      <label className="sr-only" htmlFor="note-body">Your note</label>
      <textarea
        id="note-body"
        className={s.body}
        rows={3}
        maxLength={NOTE_MAX}
        placeholder="Leave a little note"
        value={body}
        onChange={(e) => { setBody(e.target.value); if (state !== "sending") setState("idle"); }}
      />
      <div className={s.row}>
        <label className="sr-only" htmlFor="note-name">Your name (optional)</label>
        <input
          id="note-name"
          className={s.name}
          maxLength={NAME_MAX}
          placeholder="Name (optional)"
          autoComplete="given-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className={s.send} disabled={!body.trim() || state === "sending"}>
          {state === "sending" ? "Sending" : "Leave note"}
        </button>
      </div>
      <p className={s.status} role="status">
        {state === "sent"
          ? "Thank you! It'll show up here once I've read it."
          : state === "error"
            ? "That didn't go through. Try again in a moment?"
            : left <= 20
              ? `${left} characters left`
              : ""}
      </p>
    </form>
  );
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [failed, setFailed] = useState(!notesReady);

  useEffect(() => {
    if (!notesReady) return;
    fetchNotes().then(setNotes, () => setFailed(true));
  }, []);

  if (failed) return <p className={s.empty}>The message board is taking a nap. Check back soon.</p>;

  return (
    <div className={s.board}>
      <Compose />
      {notes && notes.length === 0 && <p className={s.empty}>No notes yet. Be the first.</p>}
      {notes && notes.length > 0 && (
        <div className={s.slips}>
          {notes.map((n) => <Slip key={n.id} n={n} />)}
        </div>
      )}
    </div>
  );
}
