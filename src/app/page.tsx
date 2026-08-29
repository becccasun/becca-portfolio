import Link from "next/link";
import PostcardHero from "@/components/postcards/PostcardHero";
import WorkGrid from "@/components/WorkGrid";
import { getTopLevelWork } from "@/lib/work";
import styles from "./page.module.css";

export default function HomePage() {
  const work = getTopLevelWork();

  return (
    <>
      {/* The secret library (the pull string and its panel) is built and
          parked, not deleted: src/components/library/ and src/lib/library.ts.
          Re-mounting it here is the only step to bring it back. Held off
          the launch because it wants real artwork and real builds behind
          it, and the case studies come first. */}
      <PostcardHero />

      <section id="work" className={`container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <p className="eyebrow">Featured Works</p>
        </div>
        {/* Featured is tier 1 only. Tier 2 still renders as the lighter
            list elsewhere, but the home page shouldn't be the place any
            archived project is found. */}
        <WorkGrid items={work} showSecondary={false} showSubtitle={false} />
        <div className={styles.sectionFoot}>
          <Link href="/work" className="link">
            See All Works
          </Link>
        </div>
      </section>
    </>
  );
}
