"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  /* The hero says when a postcard is being read up close; the bar draws
     itself up out of the frame for as long as that lasts, and comes
     back down on the way out. */
  const [retracted, setRetracted] = useState(false);

  useEffect(() => {
    const onFocus = (e: Event) => {
      setRetracted(Boolean((e as CustomEvent).detail?.focused));
    };
    window.addEventListener("hero:focus", onFocus);
    return () => window.removeEventListener("hero:focus", onFocus);
  }, []);

  return (
    <header
      className={`${styles.header} ${retracted ? styles.headerUp : ""}`}
    >
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
