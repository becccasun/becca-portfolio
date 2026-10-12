import { heroBand, site, works } from "@/content";
import Header from "@/components/Header";
import HeroCanvas from "@/components/HeroCanvas";
// Stamps are set aside for now (StampRow + Stamp still in components/); the hero is the zine field.
import ZineField from "@/components/ZineField";
import ComingSoonCard from "@/components/ComingSoonCard";
import Reveal from "@/components/Reveal";
import s from "./page.module.css";

export default function Home() {
  return (
    <>
      <Header />
      <Reveal />

      <main className={s.main}>
        {/* Hero */}
        <section className={s.hero}>
          <div className={s.heroBg}><HeroCanvas /></div>
          <div className={s.zines}><ZineField /></div>
          <div className={s.heroRow}>
            {(site.heroLead || site.heroBody) && (
              <div className={s.heroText}>
                {site.heroLead && <p className="t30 reveal" style={{ color: "var(--ink)" }}>{site.heroLead}</p>}
                {site.heroBody && (
                  <p className="t30 reveal" style={{ color: "var(--muted)", "--d": "0.08s" } as React.CSSProperties}>{site.heroBody}</p>
                )}
              </div>
            )}
            <div className={`reveal ${s.band}`}>
              <p className={s.bandTagline}>{heroBand.tagline}</p>
              <div className={s.bandStack}>
                <p className={s.bandSource}>
                  <span>{heroBand.source}</span>
                  <span className={s.bandNote}>{heroBand.sourceNote}</span>
                </p>
                <ul className={s.bandRoles}>
                  {heroBand.roles.map((r) => (
                    <li key={r.text}>
                      {r.text}
                      <img src={r.logo} alt="" width={22} height={22} className={s.bandLogo} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Works: two-column thumbnail + title grid, same format as the live homepage. Not linked yet. */}
        {/* The works sheet slides up over the pinned hero like a drawer */}
        <div className={s.sheet}>
        <section id="work" className={s.works}>
          {works.map((w) => {
            const inner = (
              <>
                {w.image ? <img src={w.image} alt="" className={s.workThumb} style={w.fit ? { objectFit: w.fit, background: w.bg, padding: w.pad, boxSizing: "border-box" } : undefined} /> : <div className={s.workThumb} aria-hidden />}
                {w.kicker && <p className={s.workKicker}>{w.kicker}</p>}
                <h2 className={s.workTitle}>{w.title}</h2>
                {w.blurb && <p className={s.workBlurb}>{w.blurb}</p>}
              </>
            );
            return w.comingSoon ? (
              <ComingSoonCard key={w.title} className={`reveal ${s.work}`}>{inner}</ComingSoonCard>
            ) : (
              <a key={w.title} href={`/work/${w.slug}`} className={`reveal ${s.work}`}>{inner}</a>
            );
          })}
        </section>
        </div>
      </main>

    </>
  );
}
