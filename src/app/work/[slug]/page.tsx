import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllWork, getWork } from "@/lib/work";
import Toc from "@/components/case/Toc";
import {
  Section,
  Prose,
  Figure,
  Video,
  Gallery,
  PullQuote,
  Spacer,
} from "@/components/case/blocks";
import styles from "./page.module.css";

const mdxComponents = {
  Section,
  Prose,
  Figure,
  Video,
  Gallery,
  PullQuote,
  Spacer,
};

export function generateStaticParams() {
  return getAllWork().map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) return {};
  return { title: work.meta.title, description: work.meta.subtitle };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) notFound();
  const { meta, content } = work;

  return (
    <article className={styles.page}>
      <div className={styles.hero}>
        {meta.cover && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={meta.cover} alt="" className={styles.heroImage} />
        )}
      </div>

      <div className={`container ${styles.layout}`}>
        <Toc sections={meta.sections} />
        <div className={styles.body}>
          <header className={styles.head}>
            <h1 className={`serif ${styles.title}`}>{meta.title}</h1>
            <p className={styles.subtitle}>{meta.subtitle}</p>
            <p className={styles.tags}>
              {[`${meta.year} · ${meta.role}`, ...meta.tags].join(" · ")}
            </p>
          </header>
          <MDXRemote source={content} components={mdxComponents} />
        </div>
      </div>
    </article>
  );
}
