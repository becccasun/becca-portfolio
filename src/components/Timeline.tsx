import Link from "next/link";
import { TIMELINE } from "@/lib/site";
import styles from "./Timeline.module.css";

export default function Timeline() {
  return (
    <ol className={styles.timeline}>
      {TIMELINE.map((entry) => {
        const inner = (
          <>
            <span className={styles.date}>{entry.date}</span>
            <span className={styles.title}>{entry.title}</span>
            <span className={styles.detail}>{entry.detail}</span>
          </>
        );
        return (
          <li key={`${entry.title}-${entry.date}`}>
            {entry.href ? (
              <Link href={entry.href} className={styles.row}>
                {inner}
              </Link>
            ) : (
              <div className={styles.row}>{inner}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
