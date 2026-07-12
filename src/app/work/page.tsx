import type { Metadata } from "next";
import WorkGrid from "@/components/WorkGrid";
import { getAllWork, WORK_CATEGORIES } from "@/lib/work";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Work",
  description: "The full archive: shipped products, experiments, and studies.",
};

export default function WorkArchivePage() {
  const work = getAllWork();
  const groups = WORK_CATEGORIES.map((cat) => ({
    ...cat,
    items: work.filter((w) => w.category === cat.id),
  })).filter((g) => g.items.length > 0);

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1 className={`serif ${styles.title}`}>All work</h1>
        <nav className={styles.toc} aria-label="Work categories">
          {groups.map((g) => (
            <a key={g.id} href={`#${g.id}`} className={styles.tocLink}>
              {g.label}
            </a>
          ))}
        </nav>
      </header>

      {groups.map((g) => (
        <section key={g.id} id={g.id} className={styles.group}>
          <h2 className={styles.groupTitle}>{g.label}</h2>
          <WorkGrid items={g.items} flat />
        </section>
      ))}
    </div>
  );
}
