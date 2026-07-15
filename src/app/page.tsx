import Link from "next/link";
import PostcardHero from "@/components/postcards/PostcardHero";
import WorkGrid from "@/components/WorkGrid";
import { getAllWork } from "@/lib/work";
import styles from "./page.module.css";

export default function HomePage() {
  const work = getAllWork();

  return (
    <>
      <PostcardHero />

      <section id="work" className={`container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <p className="eyebrow">Featured Works</p>
        </div>
        <WorkGrid items={work} />
        <div className={styles.sectionFoot}>
          <Link href="/work" className="link">
            See All Works
          </Link>
        </div>
      </section>
    </>
  );
}
