import type { ReactNode } from "react";
import s from "./Chat.module.css";

/** A visitor question in the chat stack: a dark chip, tail corner bottom right. Figma: Chat Question. */
export function ChatQuestion({ children }: { children: ReactNode }) {
  return <div className={s.question}>{children}</div>;
}

/** The mascot's reply: a frosted bubble whose tail points down at the mascot. Figma: Chat Reply. */
export function ChatReply({ children }: { children: ReactNode }) {
  return <div className={s.reply}>{children}</div>;
}
