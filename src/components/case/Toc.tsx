"use client";
import { useEffect, useState } from "react";
import s from "./case.module.css";

// Sticky contents list; the section in view is highlighted.
export default function Toc({ sections }: { sections: { id: string; title: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-20% 0px -70% 0px" }
    );
    sections.forEach((x) => {
      const el = document.getElementById(x.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [sections]);

  return (
    <nav className={s.toc} aria-label="Contents">
      <p className={s.eyebrow}>Contents</p>
      <ol>
        {sections.map((x) => (
          <li key={x.id}>
            <a href={`#${x.id}`} className={active === x.id ? s.active : undefined}>{x.title}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
