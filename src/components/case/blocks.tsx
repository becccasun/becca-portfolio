import s from "./blocks.module.css";

// Building blocks for case study bodies. Text stays in the reading column; media can
// go `wide` to the full body column.

export function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className={s.section}>
      <h2 className={s.title}>{title}</h2>
      {children}
    </section>
  );
}

export function Subhead({ children }: { children: React.ReactNode }) {
  return <h3 className={s.subhead}>{children}</h3>;
}

export function Prose({ children }: { children: React.ReactNode }) {
  return <div className={s.prose}>{children}</div>;
}

export function Placeholder({ label = "Image", ratio = "16 / 10", wide = false }: { label?: string; ratio?: string; wide?: boolean }) {
  return (
    <figure className={`${s.media} ${wide ? s.wide : ""}`}>
      <div className={`${s.well} ${s.placeholder}`} style={{ aspectRatio: ratio }}>{label}</div>
    </figure>
  );
}

export function Figure({ src, alt = "", caption, wide = false }: { src: string; alt?: string; caption?: string; wide?: boolean }) {
  return (
    <figure className={`${s.media} ${wide ? s.wide : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <div className={s.well}><img src={src} alt={alt} loading="lazy" /></div>
      {caption && <figcaption className={s.caption}>{caption}</figcaption>}
    </figure>
  );
}

export function Video({ src, caption, wide = false }: { src: string; caption?: string; wide?: boolean }) {
  return (
    <figure className={`${s.media} ${wide ? s.wide : ""}`}>
      <div className={s.well}><video src={src} autoPlay loop muted playsInline /></div>
      {caption && <figcaption className={s.caption}>{caption}</figcaption>}
    </figure>
  );
}

export function Gallery({ children, caption }: { children: React.ReactNode; caption?: string }) {
  return (
    <figure className={`${s.media} ${s.wide}`}>
      <div className={s.gallery}>{children}</div>
      {caption && <figcaption className={s.caption}>{caption}</figcaption>}
    </figure>
  );
}

export function Table({ head, rows, caption }: { head: string[]; rows: (string | number)[][]; caption?: string }) {
  return (
    <figure className={`${s.media} ${s.wide}`}>
      <table className={s.table}>
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
      </table>
      {caption && <figcaption className={s.caption}>{caption}</figcaption>}
    </figure>
  );
}

export function Quote({ children, by }: { children: React.ReactNode; by?: string }) {
  return (
    <blockquote className={s.quote}>
      <p>{children}</p>
      {by && <cite>{by}</cite>}
    </blockquote>
  );
}

// Screenshot with numbered markers; the notes list underneath explains each one.
export function Annotated({ src, alt = "", marks, caption, tone = "friction" }: {
  src: string; alt?: string; caption?: string; tone?: "friction" | "good";
  marks: { x: number; y: number; note: string }[];
}) {
  return (
    <figure className={`${s.media} ${s.wide} ${tone === "good" ? s.good : ""}`}>
      <div className={`${s.well} ${s.annotated}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" />
        {marks.map((m, i) => (
          <span key={i} className={s.mark} style={{ left: `${m.x}%`, top: `${m.y}%` }}>{i + 1}</span>
        ))}
      </div>
      <ol className={s.marks}>
        {marks.map((m, i) => <li key={i}><span className={s.markNum}>{i + 1}</span>{m.note}</li>)}
      </ol>
      {caption && <figcaption className={s.caption}>{caption}</figcaption>}
    </figure>
  );
}

// Horizontal funnel: each bar is sized against the first stage.
export function Funnel({ stages, caption }: { stages: { label: string; value: number }[]; caption?: string }) {
  const top = stages[0]?.value || 1;
  return (
    <figure className={`${s.media} ${s.wide}`}>
      <div className={s.funnel}>
        {stages.map((st) => (
          <div key={st.label} className={s.funnelRow}>
            <span className={s.funnelLabel}>{st.label}</span>
            <span className={s.funnelTrack}><span style={{ width: `${(st.value / top) * 100}%` }} /></span>
            <span className={s.funnelValue}>{st.value}</span>
          </div>
        ))}
      </div>
      {caption && <figcaption className={s.caption}>{caption}</figcaption>}
    </figure>
  );
}

// A row of headline numbers.
export function Stats({ items }: { items: { value: string; label: string }[] }) {
  return (
    <dl className={s.stats}>
      {items.map((it) => (
        <div key={it.label}><dt>{it.label}</dt><dd>{it.value}</dd></div>
      ))}
    </dl>
  );
}

// Option list for a design decision: what was on the table, which one won, and why.
export function Decision({ options, chose }: { options: { name: string; note: string }[]; chose: string }) {
  return (
    <div className={s.decision}>
      {options.map((o) => (
        <div key={o.name} className={o.name === chose ? s.chosen : undefined}>
          <p className={s.optName}>{o.name}{o.name === chose && <span className={s.optTag}>Chosen</span>}</p>
          <p className={s.optNote}>{o.note}</p>
        </div>
      ))}
    </div>
  );
}

// The real prototype, running inside the page, with a way out to a full tab.
export function LivePrototype({ src, title, caption, ratio = "16 / 10" }: { src: string; title: string; caption?: string; ratio?: string }) {
  return (
    <figure className={`${s.media} ${s.wide}`}>
      <div className={s.browser}>
        <div className={s.browserBar}>
          <span aria-hidden className={s.dots}><i /><i /><i /></span>
          <span className={s.browserUrl}>{src.replace(/^https?:\/\//, "")}</span>
          <a href={src} target="_blank" rel="noreferrer" className={s.browserOpen}>Open in new tab ↗</a>
        </div>
        <iframe src={src} title={title} loading="lazy" style={{ aspectRatio: ratio }} className={s.browserFrame} />
      </div>
      {caption && <figcaption className={s.caption}>{caption}</figcaption>}
    </figure>
  );
}
