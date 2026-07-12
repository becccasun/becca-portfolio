"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";
import styles from "./Nav.module.css";

const LINKS = [
  { href: "/work", label: "Works" },
  { href: "/play", label: "Play" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.wordmark}>
          {SITE.wordmark}
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`${styles.navLink} ${
                pathname.startsWith(l.href) ? styles.active : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            className={styles.ask}
            onClick={() => window.dispatchEvent(new CustomEvent("chat:open"))}
            data-cursor-label="Ask"
          >
            Ask about my work
          </button>
        </nav>
      </div>
    </header>
  );
}
