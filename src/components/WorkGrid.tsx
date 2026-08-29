import Link from "next/link";
import type { WorkMeta } from "@/lib/work";
import WorkTileCover from "./WorkTileCover";
import styles from "./WorkGrid.module.css";

/** Used when a project has no art, or its file could not be measured. */
const DEFAULT_RATIO = 1.6;

type Placed = {
  item: WorkMeta;
  /** Shape after the column solve — what the two-column layout draws. */
  ratio: number;
  /** The image's own shape, used by the single-column phone layout. */
  trueRatio: number;
  /** Position in the original reading order, restored on narrow screens. */
  order: number;
};

/**
 * Solves two columns to a flush bottom edge.
 *
 * Tiles alternate between the columns in reading order, so the two run
 * as independent streams rather than locked rows. Each column is then
 * scaled by a single factor until both reach the same height, which
 * crops every tile in that column by the same small proportion instead
 * of distorting one badly — the sandwiched tiles stay closest to true
 * that way, and the correction is spread rather than dumped.
 *
 * The solve is in aspect-ratio space, not pixels, which is what makes
 * it hold at every viewport width. Two conditions buy that: the columns
 * carry the same number of tiles, and every caption is the same height
 * (fixed in the stylesheet). The fixed-height parts of a column then
 * cancel out of the comparison, leaving only the images — and those
 * scale with the column, so a solve that balances at one width balances
 * at all of them. An odd tile out would break the first condition, so
 * it goes full width beneath the columns, where it is flush by
 * definition.
 *
 * Nothing is clamped. Wildly mismatched art produces a visible crop,
 * which is the point: it shows Rebecca which image to re-cut.
 */
function balance(items: WorkMeta[]): {
  columns: [Placed[], Placed[]];
  full: WorkMeta | null;
} {
  const odd = items.length % 2 === 1;
  const full = odd ? items[items.length - 1] : null;
  const paired = odd ? items.slice(0, -1) : items;

  const place = (w: WorkMeta, order: number): Placed => {
    const r = w.thumbRatio && w.thumbRatio > 0 ? w.thumbRatio : DEFAULT_RATIO;
    return { item: w, ratio: r, trueRatio: r, order };
  };

  const indexed = paired.map(place);
  const left = indexed.filter((_, i) => i % 2 === 0);
  const right = indexed.filter((_, i) => i % 2 === 1);

  // Height per unit of column width is 1/ratio, so a column's image
  // height is the sum of the inverses.
  const sum = (col: Placed[]) =>
    col.reduce((total, p) => total + 1 / p.ratio, 0);
  const sumLeft = sum(left);
  const sumRight = sum(right);

  if (sumLeft > 0 && sumRight > 0) {
    const target = (sumLeft + sumRight) / 2;
    const scale = (col: Placed[], total: number) => {
      const factor = target / total;
      // Taller by `factor` at the same width means dividing the ratio.
      for (const p of col) p.ratio = p.ratio / factor;
    };
    scale(left, sumLeft);
    scale(right, sumRight);
  }

  return { columns: [left, right], full };
}

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
  const { columns, full } = balance(primary);

  function tile(w: WorkMeta, ratio: number, trueRatio: number, order: number) {
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
        style={
          {
            "--tile-ratio": String(ratio),
            "--tile-ratio-true": String(trueRatio),
            "--tile-order": String(order),
          } as React.CSSProperties
        }
      >
        <div className={styles.coverStack}>
          <WorkTileCover image={art} video={w.thumbnailVideo} fallback={w.title} />
          {isUmbrella && (
            <span className={styles.countChip}>{w.childCount} projects</span>
          )}
        </div>

        {/* Every caption is the same height whatever it carries: the
            flush bottom edge is solved from the images alone, which
            only holds while the parts around them are constant. */}
        <div className={styles.tileMeta}>
          <span className={`pills ${styles.tilePills}`}>
            {w.tags.map((t) => (
              <span key={t} className="pill">
                {t}
              </span>
            ))}
          </span>
          <h3 className={styles.tileTitle}>{w.title}</h3>
          {showSubtitle && (
            <p className={styles.tileSubtitle}>{w.subtitle}</p>
          )}
          <p className={`eyebrow ${styles.tileEyebrow}`}>
            {w.year} · {w.role}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.bento}>
        {columns.map((col, i) => (
          <div key={i} className={styles.column}>
            {col.map((p) => tile(p.item, p.ratio, p.trueRatio, p.order))}
          </div>
        ))}
      </div>

      {/* The odd tile out. Full width rather than left hanging in one
          column, which would put a ragged edge on the section. */}
      {full && (
        <div className={styles.fullRow}>
          {(() => {
            const r =
              full.thumbRatio && full.thumbRatio > 0
                ? full.thumbRatio
                : DEFAULT_RATIO;
            // Twice the width for the same art, so the frame is twice
            // as wide relative to its height.
            return tile(full, r * 2, r, primary.length - 1);
          })()}
        </div>
      )}

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
