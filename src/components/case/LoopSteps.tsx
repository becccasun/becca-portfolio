import s from "./blocks.module.css";

// A cycle of steps drawn as a ring of cards, with the failures that changed it beneath.
export default function LoopSteps({ steps, failures }: { steps: string[]; failures?: { title: string; note: string }[] }) {
  return (
    <figure className={`${s.media} ${s.wide}`}>
      <ol className={s.loop}>
        {steps.map((st, i) => (
          <li key={st}>
            <span className={s.stepNum}>{i + 1}</span>
            <span>{st}</span>
            <span className={s.loopArrow} aria-hidden>{i === steps.length - 1 ? "↺" : "→"}</span>
          </li>
        ))}
      </ol>
      {failures && (
        <div className={s.decision}>
          {failures.map((f) => (
            <div key={f.title}>
              <p className={s.optName}>{f.title}</p>
              <p className={s.optNote}>{f.note}</p>
            </div>
          ))}
        </div>
      )}
    </figure>
  );
}
