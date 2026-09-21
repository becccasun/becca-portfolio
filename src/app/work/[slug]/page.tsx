import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllWork, getChildren, getSiblings, getWork } from "@/lib/work";
import Toc from "@/components/case/Toc";
import ProjectRail, { ProjectChips } from "@/components/case/ProjectRail";
import ProjectIndex, { ProjectNav } from "@/components/case/ProjectIndex";
import ProjectFacts from "@/components/case/ProjectFacts";
import InteractiveDemo from "@/components/case/InteractiveDemo";
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
  InteractiveDemo,
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

  // Three shapes share this route: a standalone case study, an umbrella
  // hub (has children), and a sub-project (has a parent). The last two
  // swap the table of contents for the project switcher.
  const children = getChildren(slug);
  const isHub = children.length > 0;
  const umbrella = isHub || Boolean(meta.parent);

  const siblings = umbrella ? getSiblings(meta) : [];
  const parentMeta = meta.parent ? getWork(meta.parent)?.meta : meta;
  const railProps = {
    parent: {
      slug: parentMeta?.slug ?? slug,
      title: parentMeta?.title ?? meta.title,
    },
    projects: siblings.map((s) => ({
      slug: s.slug,
      label: s.projectLabel ?? s.title,
      sections: s.sections,
    })),
    activeSlug: isHub ? null : slug,
  };

  const index = siblings.findIndex((s) => s.slug === slug);
  const prev = index > 0 ? siblings[index - 1] : undefined;
  const next =
    index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : undefined;

  return (
    <article className={styles.page}>
      <div className={styles.hero}>
        {meta.cover && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={meta.cover} alt="" className={styles.heroImage} />
        )}
      </div>

      <div className={`container ${styles.layout}`}>
        {umbrella ? (
          <ProjectRail {...railProps} />
        ) : (
          <Toc sections={meta.sections} />
        )}
        <div className={styles.body}>
          {umbrella && <ProjectChips {...railProps} />}
          <header className={styles.head}>
            {meta.parent && parentMeta && (
              <p className="eyebrow">
                {parentMeta.title} · Project {index + 1} of {siblings.length}
              </p>
            )}
            <h1 className={`display ${styles.title}`}>{meta.title}</h1>
            {/* Central idea, then role/duration/scope/outcome, then the
                link out. Scope replaces the tag pills that used to sit
                here — the two said the same thing twice. */}
            <ProjectFacts meta={meta} />
          </header>
          <MDXRemote source={content} components={mdxComponents} />
          {isHub && <ProjectIndex items={children} />}
          <ProjectNav prev={prev} next={next} />
        </div>
      </div>
    </article>
  );
}
