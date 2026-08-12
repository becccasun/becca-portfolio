import { GRID_ORDER, PLAY_ITEMS, type PlayCategory } from "@/lib/play";
import styles from "./PlayGrid.module.css";

/**
 * Grid view, filtered by the tab selected in PlayView ("all" or one
 * category). "All" runs in category order — digital, then crafts, then
 * photo — rather than as one flat recency list, so the newest pieces in
 * one medium can't push a whole category off the top of the page.
 * Within a category it's still most recently added first.
 */
export default function PlayGrid({
  filter,
}: {
  filter: PlayCategory | "all";
}) {
  const rank = (c: PlayCategory) => GRID_ORDER.indexOf(c);
  const items = PLAY_ITEMS.filter(
    (i) => filter === "all" || i.category === filter
  ).sort((a, b) => rank(a.category) - rank(b.category) || b.added - a.added);

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.grid}>
        {items.map((item) => {
          const body = (
            <>
              <div className={styles.well}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.title} loading="lazy" />
              </div>
              <div className={styles.meta}>
                <span className={styles.name}>{item.title}</span>
                {/* Originals caption themselves by material; everything
                    else by where the link lands. */}
                <span className={styles.detail}>
                  {item.medium ?? item.source} · {item.year}
                </span>
              </div>
            </>
          );

          // An original painting is the artefact, and a placeholder has
          // nowhere to go yet. Neither should be a link to "#", which
          // just reopens this page in a new tab.
          return item.href && item.href !== "#" ? (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className={styles.tile}
              data-cursor-label={`View on ${item.source}`}
            >
              {body}
            </a>
          ) : (
            <div key={item.id} className={styles.tile}>
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
}
