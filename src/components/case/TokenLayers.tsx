import s from "./blocks.module.css";

type Row = { brand: string; hex: string; alias: string; use: string };

// Brand → alias → mapping, read left to right: a raw value, the meaning it's given,
// and the place it ends up.
export default function TokenLayers({ rows }: { rows: Row[] }) {
  return (
    <figure className={`${s.media} ${s.wide}`}>
      <div className={s.layers}>
        <div className={s.layerHead}><span>Brand</span><span>Alias</span><span>Mapping</span></div>
        {rows.map((r) => (
          <div key={r.alias} className={s.layerRow}>
            <span className={s.layerCell}>
              <i className={s.chip} style={{ background: r.hex }} />
              <span><code>{r.brand}</code><small>{r.hex}</small></span>
            </span>
            <span className={s.layerArrow} aria-hidden>→</span>
            <span className={s.layerCell}><code>{r.alias}</code></span>
            <span className={s.layerArrow} aria-hidden>→</span>
            <span className={s.layerCell}>{r.use}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}
