import { DM_Sans, Inter } from "next/font/google";
import s from "./blocks.module.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const dm = DM_Sans({ subsets: ["latin"], display: "swap" });

// The same line in both faces, so the difference is visible rather than described.
export default function FontCompare({ chosen = "DM Sans" }: { chosen?: string }) {
  const faces = [
    { name: "Inter", cls: inter.className, note: "Very accessible, and the default everywhere" },
    { name: "DM Sans", cls: dm.className, note: "Clean enough for finance, with some personality" },
  ];
  return (
    <figure className={`${s.media} ${s.wide}`}>
      <div className={s.fonts}>
        {faces.map((f) => (
          <div key={f.name} className={`${s.font} ${f.name === chosen ? s.fontChosen : ""}`}>
            <p className={s.fontName}>{f.name}{f.name === chosen && <span className={s.optTag}>Chosen</span>}</p>
            <p className={`${f.cls} ${s.fontAg}`}>Ag</p>
            <p className={`${f.cls} ${s.fontLine}`}>Move money with Loop</p>
            <p className={`${f.cls} ${s.fontNums}`}>$45,000.00 · 0123456789</p>
            <p className={s.optNote}>{f.note}</p>
          </div>
        ))}
      </div>
    </figure>
  );
}
