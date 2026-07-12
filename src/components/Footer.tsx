import { SITE } from "@/lib/site";
import styles from "./Footer.module.css";

/**
 * Signature footer. The playful interaction concept is still TBD with
 * Rebecca (spec item 9) so this ships the structure: big serif sign-off,
 * contact links, and a reserved slot where the interaction will live.
 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={`serif ${styles.signoff}`}>
          Say hi, I read everything.
        </p>

        <div className={styles.playSlot} data-footer-interaction-slot />

        <div className={styles.meta}>
          <a href={`mailto:${SITE.email}`} className="link">
            {SITE.email}
          </a>
          <div className={styles.links}>
            <a
              href="https://www.linkedin.com/"
              className="link"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/"
              className="link"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a href="/resume.pdf" className="link">
              Resume
            </a>
          </div>
          <p className={styles.colophon}>
            © {new Date().getFullYear()} {SITE.name}. Designed and built by me.
          </p>
        </div>
      </div>
    </footer>
  );
}
