import Link from "next/link";
import Hero from "@/components/Hero";
import WorkGrid from "@/components/WorkGrid";
import Timeline from "@/components/Timeline";
import { getAllWork } from "@/lib/work";
import styles from "./page.module.css";

export default function HomePage() {
  const work = getAllWork();

  return (
    <>
      <Hero />

      <section id="work" className={`container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <p className="eyebrow">Selected work</p>
          <Link href="/work" className="link">
            See more work
          </Link>
        </div>
        <WorkGrid items={work} />
      </section>

      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <p className="eyebrow">Experience</p>
        </div>
        <Timeline />
      </section>
    </>
  );
}
