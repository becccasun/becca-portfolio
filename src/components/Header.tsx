import Image from "next/image";
import { site } from "@/content";
import s from "./Header.module.css";
import { withBase } from "@/lib/base";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";

// Eight stacked backdrop blurs (0.5px → 64px), each masked to a 3/8-wide band that
// slides down the 126px strip: the original's progressive blur.
const LAYERS = [0.5, 1, 2, 4, 8, 16, 32, 64];

// Name and role on the left, logo in the dead centre, pages on the right. Three columns
// with equal outer tracks, so the logo stays centred however long either side is.
export default function Header() {
  return (
    <>
      <div className={s.blur} aria-hidden>
        {LAYERS.map((px, i) => {
          const a = i * 12.5;
          const stops = [a, a + 12.5, a + 25, a + 37.5]
            .map((p, j) => `${j === 0 || j === 3 ? "rgba(0,0,0,0)" : "#000"} ${Math.min(p, 100)}%`)
            .join(", ");
          const mask = `linear-gradient(to top, ${stops})`;
          return (
            <div
              key={px}
              style={{ backdropFilter: `blur(${px}px)`, WebkitBackdropFilter: `blur(${px}px)`, maskImage: mask, WebkitMaskImage: mask, zIndex: i + 1 }}
            />
          );
        })}
      </div>
      <header className={s.header}>
        <div className={`col ${s.inner}`}>
          <a href={withBase("/")} className={`t16 ${s.name}`}>
            {site.name}
            <span className={s.sep} aria-hidden>|</span>
            <span className={s.role}>{site.role}</span>
          </a>
          <a href={withBase("/")} className={s.logo} aria-label={`${site.name}, home`}>
            <Image src={withBase("/logo.png")} alt="" width={36} height={36} priority />
          </a>
          <NavLinks />
          <MobileMenu />
        </div>
      </header>
    </>
  );
}
