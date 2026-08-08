import Link from "next/link";
import type { WorkMeta } from "@/lib/work";
import styles from "./ProjectIndex.module.css";

/**
 * The umbrella hub's card grid. Everything under Loop, listed once, so
 * landing on /work/loop makes the scope obvious before any reading.
 */
export default function ProjectIndex({
  items,
  eyebrow = "Projects",
}: {
  items: WorkMeta[];
  eyebrow?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className={styles.wrap} aria-label="Projects">
      <p className="eyebrow">
        {eyebrow} ({items.length})
      </p>

      <div className={styles.grid}>
        {items.map((p) => (
          <Link
            key={p.slug}
            href={`/work/${p.slug}`}
            className={styles.card}
            data-cursor-label="Read"
          >
            <div className={styles.cover}>
              {p.cover ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={p.cover} alt="" loading="lazy" />
              ) : (
                <span className={`serif ${styles.coverFallback}`}>
                  {p.projectLabel ?? p.title}
                </span>
              )}
            </div>

            {p.tags.length > 0 && (
              <span className="pills">
                {p.tags.map((t) => (
                  <span key={t} className="pill">
                    {t}
                  </span>
                ))}
              </span>
            )}
            <div className={styles.meta}>
              {p.status && <p className={styles.status}>{p.status}</p>}
              <h3 className={styles.title}>{p.title}</h3>
              <p className={styles.subtitle}>{p.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Previous / next project, at the foot of a sub-project case study. */
export function ProjectNav({
  prev,
  next,
}: {
  prev?: WorkMeta;
  next?: WorkMeta;
}) {
  if (!prev && !next) return null;

  return (
    <nav className={styles.pager} aria-label="Other projects">
      {prev ? (
        <Link href={`/work/${prev.slug}`} className={styles.pagerLink}>
          <span className="eyebrow">Previous</span>
          <span className={styles.pagerTitle}>
            {prev.projectLabel ?? prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          href={`/work/${next.slug}`}
          className={`${styles.pagerLink} ${styles.pagerNext}`}
        >
          <span className="eyebrow">Next</span>
          <span className={styles.pagerTitle}>
            {next.projectLabel ?? next.title}
          </span>
        </Link>
      )}
    </nav>
  );
}
