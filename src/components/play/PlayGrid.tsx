import { PLAY_ITEMS } from "@/lib/play";
import styles from "./PlayGrid.module.css";

/** Grid view: linked tiles with "View on ..." cursor labels. */
export default function PlayGrid() {
  return (
    <div className={`container ${styles.grid}`}>
      {PLAY_ITEMS.map((item) => (
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
  );
}
