import type { Project } from "@/content";
import s from "./Mockup.module.css";

// Neutral stand-ins for project imagery: a fanned row of phones or a desktop window,
// tinted with the project's hue. Replace with <Image> once you have real shots.
export default function Mockup({ p }: { p: Project }) {
  const [a, b] = p.hue;
  if (p.mockup === "desktop") {
    return (
      <div className={s.stage}>
        <div className={`reveal ${s.window}`}>
          <div className={s.bar}><i /><i /><i /></div>
          <div className={s.body}>
            <div className={s.side}>{Array.from({ length: 7 }, (_, i) => <span key={i} style={{ width: `${55 + ((i * 17) % 40)}%` }} />)}</div>
            <div className={s.canvas} style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} />
          </div>
        </div>
      </div>
    );
  }
  const phones = [
    { x: -330, y: 60, r: 0, z: 1 },
    { x: 330, y: 60, r: 0, z: 1 },
    { x: -140, y: 0, r: 0, z: 2 },
    { x: 140, y: 30, r: 0, z: 2 },
    { x: 0, y: -12, r: 0, z: 3, hero: true },
  ];
  return (
    <div className={s.stage}>
      {phones.map((ph, i) => (
        <div
          key={i}
          className={`reveal ${s.phone}`}
          style={{ "--d": `${0.08 * i}s`, left: `calc(50% + ${ph.x}px)`, top: 46 + ph.y, zIndex: ph.z } as React.CSSProperties}
        >
          <div className={s.screen}>
            <div className={s.notch} />
            <div className={s.art} style={{ background: `linear-gradient(160deg, ${a}, ${b})` }} />
            <span className={s.line} style={{ width: "70%" }} />
            <span className={s.line} style={{ width: "50%" }} />
            <span className={s.line} style={{ width: "62%" }} />
          </div>
          {ph.hero && <div className={s.card} style={{ background: `linear-gradient(180deg, ${b}, ${a})` }} />}
        </div>
      ))}
    </div>
  );
}
