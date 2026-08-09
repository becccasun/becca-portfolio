import type { WorkMeta } from "@/lib/work";
import styles from "./ProjectFacts.module.css";

/**
 * The block every case study opens with, under the title: the central
 * idea, then role / duration / scope / outcome as four columns, then a
 * link out to the live thing if there is one.
 *
 * Columns always render, even half-empty — four headings in a fixed order
 * are easier to scan across projects than a grid that changes shape. A
 * column with nothing behind it yet shows an em dash rather than lying.
 */
export default function ProjectFacts({ meta }: { meta: WorkMeta }) {
  const columns: { label: string; values: string[] }[] = [
    { label: "Role", values: meta.roles },
    { label: "Duration", values: meta.duration ? [meta.duration] : [] },
    { label: "Scope", values: meta.scope },
    { label: "Outcome", values: meta.outcome },
  ];

  return (
    <>
      {meta.concept && (
        <div className={styles.concept}>
          <p className="eyebrow">Central idea</p>
          <p className={styles.conceptText}>{meta.concept}</p>
        </div>
      )}

      <dl className={styles.facts}>
        {columns.map((col) => (
          <div key={col.label} className={styles.col}>
            <dt className="eyebrow">{col.label}</dt>
            {col.values.length > 0 ? (
              col.values.map((v) => (
                <dd key={v} className={styles.value}>
                  {v}
                </dd>
              ))
            ) : (
              <dd className={`${styles.value} ${styles.empty}`} aria-label="Not yet documented">
                —
              </dd>
            )}
          </div>
        ))}
      </dl>

      {meta.prototype && (
        <a
          href={meta.prototype.href}
          target="_blank"
          rel="noreferrer"
          className={styles.cta}
          data-cursor-label="Open"
        >
          <span className={styles.ctaText}>
            <span className="eyebrow">{meta.prototype.note ?? "Try the live product"}</span>
            <span className={styles.ctaLabel}>{meta.prototype.label}</span>
          </span>
          <span className={styles.ctaAction} aria-hidden="true">
            Visit <span className={styles.arrow}>↗</span>
          </span>
        </a>
      )}
    </>
  );
}
