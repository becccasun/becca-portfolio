import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Toc from "@/components/case/Toc";
import { caseStudies, getCase } from "@/case-studies";
import s from "@/components/case/case.module.css";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.meta.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = getCase((await params).slug);
  return c ? { title: `${c.meta.title} · Rebecca Sun` } : {};
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const study = getCase((await params).slug);
  if (!study) notFound();
  const { meta, Body } = study;
  const facts = [
    { label: "Role", values: meta.role },
    { label: "Duration", values: meta.duration },
    { label: "Scope", values: meta.scope },
    meta.tools ? { label: "Toolkit", values: meta.tools } : { label: "Outcome", values: meta.outcome ?? [] },
  ];

  return (
    <>
      <Header />
      <article className={s.page}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className={s.cover} style={meta.coverBg ? { background: meta.coverBg } : undefined}>
          {meta.cover ? <img src={meta.cover} alt="" style={meta.coverFit ? { objectFit: meta.coverFit } : undefined} /> : "Cover image"}
        </div>

        <div className={s.layout}>
          <Toc sections={meta.sections} />
          <div className={s.body}>
            <header className={s.head}>
              <h1 className={s.title}>{meta.title}</h1>
              {meta.concept && (
                <div className={s.concept}>
                  <p className={s.eyebrow}>Central idea</p>
                  <p>{meta.concept}</p>
                </div>
              )}
              <dl className={s.facts}>
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt className={s.eyebrow}>{f.label}</dt>
                    {f.values.map((v) => <dd key={v}>{v}</dd>)}
                  </div>
                ))}
              </dl>
              {meta.link && (
                <a href={meta.link.href} target="_blank" rel="noreferrer" className={s.linkOut}>
                  {meta.link.label} <span aria-hidden>↗</span>
                </a>
              )}
            </header>
            <Body />
          </div>
        </div>
      </article>
      <Footer />
    </>
  );
}
