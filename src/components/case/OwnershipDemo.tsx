"use client";
import { useState } from "react";
import s from "./blocks.module.css";

// Live version of one guardrail: owners' shares are totalled as you type and the field
// says so the moment the total passes 100%.
export default function OwnershipDemo({ caption }: { caption?: string }) {
  const [rows, setRows] = useState([{ name: "You", pct: "60" }, { name: "Co-founder", pct: "60" }]);
  const total = rows.reduce((t, r) => t + (parseFloat(r.pct) || 0), 0);
  const over = total > 100;

  return (
    <figure className={s.media}>
      <div className={`${s.well} ${s.demo}`}>
        <p className={s.demoHead}>Who owns the business?</p>
        {rows.map((r, n) => (
          <label key={n} className={s.demoRow}>
            <span>{r.name}</span>
            <span className={`${s.demoField} ${over ? s.demoBad : ""}`}>
              <input
                inputMode="decimal" value={r.pct}
                onChange={(e) => setRows(rows.map((x, j) => (j === n ? { ...x, pct: e.target.value.replace(/[^\d.]/g, "") } : x)))}
                aria-label={`${r.name} ownership percent`}
              />
              %
            </span>
          </label>
        ))}
        <div className={s.demoBar} aria-hidden><span style={{ width: `${Math.min(total, 100)}%` }} className={over ? s.demoBarBad : undefined} /></div>
        <p className={`${s.demoNote} ${over ? s.demoNoteBad : ""}`} role="status">
          {over ? `Shares add up to ${total}%. Ownership can't be more than 100%.` : `${total}% of the business accounted for.`}
        </p>
      </div>
      {caption && <figcaption className={s.caption}>{caption}</figcaption>}
    </figure>
  );
}
