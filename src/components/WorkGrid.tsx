import Link from "next/link";
import type { WorkMeta } from "@/lib/work";
import styles from "./WorkGrid.module.css";

/**
 * Tiered grid: tier 1 gets full tiles on the home page, tier 2 renders
 * as a lighter list. Everything else lives at /work.
 */
export default function WorkGrid({
  items,
  showSecondary = true,
  flat = false,
}: {
  items: WorkMeta[];
  showSecondary?: boolean;
  /** Render every item as a tile, ignoring tiers (used by the archive). */
  flat?: boolean;
}) {
  const primary = flat ? items : items.filter((w) => w.tier === 1);
  const secondary = flat ? [] : items.filter((w) => w.tier === 2);

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {primary.map((w) => (
          <Link
            key={w.slug}
            href={`/work/${w.slug}`}
            className={styles.tile}
            data-cursor-label="View"
          >
            <div className={styles.cover}>
              {w.cover ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={w.cover} alt="" loading="lazy" />
              ) : (
                <span className={`serif ${styles.coverFallback}`}>
                  {w.title}
                </span>
              )}
            </div>
            <div className={styles.tileMeta}>
              <h3 className={styles.tileTitle}>{w.title}</h3>
              <p className={styles.tileSubtitle}>{w.subtitle}</p>
              <p className="eyebrow">
                {w.year} · {w.role}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {showSecondary && secondary.length > 0 && (
        <ul className={styles.list}>
          {secondary.map((w) => (
            <li key={w.slug}>
              <Link href={`/work/${w.slug}`} className={styles.row}>
                <span className={styles.rowTitle}>{w.title}</span>
                <span className={styles.rowSubtitle}>{w.subtitle}</span>
                <span className={styles.rowYear}>{w.year}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
