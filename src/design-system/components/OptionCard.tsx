import type { ReactNode } from "react";
import { cx } from "./cx";
import { Tag } from "./Tag";
import s from "./OptionCard.module.css";

/** A design option weighed in a case study. chosen gets the ink ring and the Chosen tag. Figma: Option Card (State). */
export function OptionCard({ name, note, chosen }: { name: string; note?: ReactNode; chosen?: boolean }) {
  return (
    <div className={cx(s.option, chosen && s.chosen)}>
      <p className={s.name}>{name}{chosen && <Tag>Chosen</Tag>}</p>
      {note && <p className={s.note}>{note}</p>}
    </div>
  );
}
