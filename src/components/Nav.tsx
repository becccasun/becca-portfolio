"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";
import styles from "./Nav.module.css";

// Works jumps to the featured section on the home page; the archive at
// /work is reached only via "See All Works" below the featured grid.
const LINKS = [
  { href: "/#work", activePrefix: "/work", label: "Works" },
  { href: "/play", activePrefix: "/play", label: "Play" },
  { href: "/blogs", activePrefix: "/blogs", label: "Blogs" },
  { href: "/about", activePrefix: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className={styles.logo} />
          <span className={styles.wordmark}>{SITE.wordmark}</span>
        </Link>

        {/* Sits outside the brand link: it labels the name, it isn't a
            second way to click home. */}
        <span className={styles.role}>
          <span className={styles.dot} aria-hidden="true" />
          {SITE.role}
        </span>

        <nav className={styles.nav} aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`${styles.navLink} ${
                pathname.startsWith(l.activePrefix) ? styles.active : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
