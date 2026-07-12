import type { Metadata } from "next";
import WorkGrid from "@/components/WorkGrid";
import { getAllWork } from "@/lib/work";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Work",
  description: "The full archive: shipped products, experiments, and studies.",
};

export default function WorkArchivePage() {
  const work = getAllWork();

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        <p className="eyebrow">Archive</p>
        <h1 className={`serif ${styles.title}`}>All work</h1>
        <p className={styles.intro}>
          Everything, not just the highlights: shipped products, class
          projects, and experiments that taught me something.
        </p>
      </header>
      <WorkGrid items={work} />
    </div>
  );
}
