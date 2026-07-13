import {
  PLAY_ITEMS,
  PLAY_CATEGORIES,
  GRID_ORDER,
} from "@/lib/play";
import styles from "./PlayGrid.module.css";

/** Grid view: category sections with "View on ..." cursor labels. */
export default function PlayGrid() {
  const groups = GRID_ORDER.map((id) => ({
    ...PLAY_CATEGORIES.find((c) => c.id === id)!,
    items: PLAY_ITEMS.filter((i) => i.category === id),
  })).filter((g) => g.items.length > 0);

  return (
    <div className={`container ${styles.wrap}`}>
      {groups.map((g) => (
        <section key={g.id} id={`play-${g.id}`} className={styles.group}>
          <h2 className={styles.groupTitle}>{g.label}</h2>
          <div className={styles.grid}>
            {g.items.map((item) => (
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
        </section>
      ))}
    </div>
  );
}
