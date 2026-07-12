import Link from "next/link";
import BottleHero from "@/components/bottle/BottleHero";
import WorkGrid from "@/components/WorkGrid";
import { getAllWork } from "@/lib/work";
import styles from "./page.module.css";

export default function HomePage() {
  const work = getAllWork();

  return (
    <>
      <BottleHero />

      <section id="work" className={`container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <p className="eyebrow">Selected work</p>
          <Link href="/work" className="link">
            See more work
          </Link>
        </div>
        <WorkGrid items={work} />
      </section>
    </>
  );
}
