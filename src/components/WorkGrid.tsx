import Link from "next/link";
import type { WorkMeta } from "@/lib/work";
import WorkTileCover from "./WorkTileCover";
import styles from "./WorkGrid.module.css";

/**
 * Tiered grid: tier 1 gets full tiles on the home page, tier 2 renders
 * as a lighter list. Everything else lives at /work.
 */
export default function WorkGrid({
  items,
  showSecondary = true,
  flat = false,
  showSubtitle = true,
}: {
  items: WorkMeta[];
  showSecondary?: boolean;
  /** Render every item as a tile, ignoring tiers (used by the archive). */
  flat?: boolean;
  /** Off on the home page, where tiles carry title and year/role only. */
  showSubtitle?: boolean;
}) {
  const primary = flat ? items : items.filter((w) => w.tier === 1);
  const secondary = flat ? [] : items.filter((w) => w.tier === 2);

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {primary.map((w) => {
          const isUmbrella = (w.childCount ?? 0) > 1;
          // A project can give the grid its own art; most just reuse the
          // case study's cover.
          const art = w.thumbnail ?? w.cover;
          return (
            <Link
              key={w.slug}
              href={`/work/${w.slug}`}
              className={styles.tile}
              data-cursor-label="View"
            >
              <div className={styles.coverStack}>
                <WorkTileCover
                  image={art}
                  video={w.thumbnailVideo}
                  fallback={w.title}
                />
                {isUmbrella && (
                  <span className={styles.countChip}>
                    {w.childCount} projects
                  </span>
                )}
              </div>

              {/* Keywords sit between the frame and the title, so every
                  tile is the same shape whatever it carries. */}
              {w.tags.length > 0 && (
                <span className="pills">
                  {w.tags.map((t) => (
                    <span key={t} className="pill">
                      {t}
                    </span>
                  ))}
                </span>
              )}

              <div className={styles.tileMeta}>
                <h3 className={styles.tileTitle}>{w.title}</h3>
                {showSubtitle && (
                  <p className={styles.tileSubtitle}>{w.subtitle}</p>
                )}
                <p className="eyebrow">
                  {w.year} · {w.role}
                </p>
              </div>
            </Link>
          );
        })}
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
