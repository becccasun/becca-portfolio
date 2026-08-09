import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogArticle, getBlogPosts } from "@/lib/blogs";
import styles from "./page.module.css";

export async function generateStaticParams() {
  const { posts } = await getBlogPosts();
  return posts.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = await getBlogArticle(slug);
  if (!found) return {};
  const { article } = found;
  return {
    title: article.title,
    description: article.excerpt,
    // Medium published it first, so point crawlers there.
    alternates: { canonical: article.href },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = await getBlogArticle(slug);
  if (!found) notFound();
  const { article, siblings } = found;

  const index = siblings.findIndex((p) => p.id === article.id);
  const next = index > 0 ? siblings[index - 1] : undefined;
  const previous =
    index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : undefined;

  return (
    <article className={`container ${styles.page}`}>
      <Link href="/blogs" className={styles.back}>
        ← All writing
      </Link>

      <header className={styles.head}>
        {article.series && <p className="eyebrow">{article.series}</p>}
        <h1 className={`display ${styles.title}`}>{article.title}</h1>
        <p className={styles.meta}>
          <time dateTime={article.date}>{article.dateLabel}</time>
          {" · "}
          {article.minutes} min read
          {article.publication && ` · ${article.publication}`}
        </p>
      </header>

      {/* Rebecca's own writing, pulled from her feed and rebuilt from an
          allowlist in lib/blogs.ts before it reaches this point. */}
      <div
        className={styles.body}
        dangerouslySetInnerHTML={{ __html: article.html }}
      />

      <footer className={styles.foot}>
        <a
          href={article.href}
          target="_blank"
          rel="noreferrer"
          className="link"
          data-cursor-label="Medium"
        >
          Read this on Medium
        </a>
        {article.tags.length > 0 && (
          <p className={styles.tags}>{article.tags.join(" · ")}</p>
        )}
      </footer>

      {(previous || next) && (
        <nav className={styles.pager} aria-label="Other writing">
          {previous ? (
            <Link href={`/blogs/${previous.id}`} className={styles.pagerLink}>
              <span className="eyebrow">Previous</span>
              <span className={styles.pagerTitle}>{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/blogs/${next.id}`}
              className={`${styles.pagerLink} ${styles.pagerNext}`}
            >
              <span className="eyebrow">Next</span>
              <span className={styles.pagerTitle}>{next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
