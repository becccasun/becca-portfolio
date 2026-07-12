import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Play",
  description: "Experiments, sketches, and things made for fun.",
};

export default function PlayPage() {
  return (
    <div className={`container ${styles.page}`}>
      <p className="eyebrow">Play</p>
      <h1 className={`serif ${styles.title}`}>Made for fun</h1>
      <p className={styles.intro}>
        Experiments, sketches, and one-night builds. This shelf fills up as I
        move things over. Check back soon.
      </p>
    </div>
  );
}
