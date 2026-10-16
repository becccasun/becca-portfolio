"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/content";
import { withBase } from "@/lib/base";
import s from "./Header.module.css";

// Phones only (the header's page links hide under 640px): a button in the header's
// right track opens a full-screen sheet of the pages. While it's open the rest of the
// page is inert, so focus and screen readers stay inside the header and the sheet.
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const button = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (!open) {
      delete html.dataset.menu;
      return;
    }
    html.dataset.menu = "open";
    const header = button.current?.closest("header");
    const others = [...document.body.children].filter((el) => el !== header && !el.contains(header ?? null)) as HTMLElement[];
    others.forEach((el) => (el.inert = true));
    first.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    // Widening past the phone breakpoint brings the inline links back, so the sheet goes
    const wide = window.matchMedia("(min-width: 641px)");
    const onWide = () => wide.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      delete html.dataset.menu;
      others.forEach((el) => (el.inert = false));
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const isCurrent = (href: string) =>
    href === "/#work" ? pathname.startsWith("/work") : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <button
        ref={button}
        type="button"
        className={s.menuButton}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={s.menuIcon} aria-hidden />
      </button>
      <nav id="mobile-menu" className={s.sheet} aria-label="Pages" hidden={!open}>
        <ul>
          {site.nav.map((l, i) => (
            <li key={l.label} style={{ "--i": i } as React.CSSProperties}>
              <a
                ref={i === 0 ? first : undefined}
                href={withBase(l.href)}
                aria-current={isCurrent(l.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
