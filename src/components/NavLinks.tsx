"use client";

import { usePathname } from "next/navigation";
import { site } from "@/content";
import { withBase } from "@/lib/base";
import { isCurrentPage } from "@/lib/nav";
import s from "./Header.module.css";

// The header's page links, with the page you're on marked (a client component only
// because it reads the current path)
export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className={s.nav} aria-label="Pages">
      {site.nav.map((l) => (
        <a
          key={l.label}
          href={withBase(l.href)}
          className={`t16 ${s.link}`}
          aria-current={isCurrentPage(l.href, pathname) ? "page" : undefined}
        >
          {l.label}
        </a>
      ))}
    </nav>
  );
}
