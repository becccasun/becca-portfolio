import { PLAY_ITEMS, type PlayCategory } from "@/lib/play";
import styles from "./PlayGrid.module.css";

/**
 * Grid view: a flat grid, most recently added first, filtered by the
 * tab selected in PlayView ("all" or one category).
 */
export default function PlayGrid({
  filter,
}: {
  filter: PlayCategory | "all";
}) {
  const items = PLAY_ITEMS.filter(
    (i) => filter === "all" || i.category === filter
  ).sort((a, b) => b.added - a.added);

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.grid}>
        {items.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className={styles.tile}
            data-cursor-label={`View on ${item.source}`}
          >
            <div className={styles.well}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.title} loading="lazy" />
            </div>
            <div className={styles.meta}>
              <span className={styles.name}>{item.title}</span>
              <span className={styles.detail}>
                {item.source} · {item.year}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
