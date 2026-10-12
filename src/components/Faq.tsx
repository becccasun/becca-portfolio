"use client";
import { useState } from "react";
import { faq } from "@/content";
import s from "./Faq.module.css";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className={`reveal ${s.list}`}>
      {faq.items.map((it, i) => (
        <div key={it.q} className={s.item} data-open={open === i}>
          <button className={s.q} onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
            <span className={s.icon} aria-hidden />
            {it.q}
          </button>
          <div className={s.aWrap}>
            <div><p className={s.a}>{it.a}</p></div>
          </div>
        </div>
      ))}
    </div>
  );
}
