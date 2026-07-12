import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description: "Who Rebecca is and how she works.",
};

export default function AboutPage() {
  return (
    <div className={`container ${styles.page}`}>
      <p className="eyebrow">About</p>
      <h1 className={`serif ${styles.title}`}>
        Design and engineering,
        <br />
        same person.
      </h1>
      <div className={styles.body}>
        <p>
          I&apos;m Rebecca, a design engineer studying at the University of
          Michigan. I care about interfaces that are fast to understand and
          feel considered, and I like owning the whole path from a Figma frame
          to a deployed component.
        </p>
        <p>
          Right now I&apos;m building at Loop and Embedder, and previously
          worked with DPSS, AgentMail, and Nezha. The details live in the case
          studies, or you can{" "}
          <a href={`mailto:${SITE.email}`} className="link">
            email me
          </a>{" "}
          and ask directly.
        </p>
      </div>
    </div>
  );
}
