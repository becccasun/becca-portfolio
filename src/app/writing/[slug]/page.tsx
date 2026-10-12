import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getBlogArticle, getBlogPosts } from "@/lib/blogs";
import s from "./article.module.css";

export async function generateStaticParams() {
  const { posts } = await getBlogPosts();
  return posts.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const found = await getBlogArticle((await params).slug);
  if (!found) return {};
  const { article } = found;
  // Medium published it first, so point crawlers there.
  return { title: `${article.title} · Rebecca Sun`, description: article.excerpt, alternates: { canonical: article.href } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const found = await getBlogArticle((await params).slug);
  if (!found) notFound();
  const { article, siblings } = found;

  const i = siblings.findIndex((p) => p.id === article.id);
  const next = i > 0 ? siblings[i - 1] : undefined;
  const previous = i >= 0 && i < siblings.length - 1 ? siblings[i + 1] : undefined;

  return (
    <>
      <Header />
      <article className={s.page}>
        <a href="/writing" className={s.back}>← All writing</a>

        <header className={s.head}>
          {article.series && <p className={s.series}>{article.series}</p>}
          <h1 className={s.title}>{article.title}</h1>
          <p className={s.meta}>
            <time dateTime={article.date}>{article.dateLabel}</time> · {article.minutes} min read
            {article.publication && ` · ${article.publication}`}
          </p>
        </header>

        {/* Her own writing from the feed, rebuilt from an allowlist in lib/blogs.ts */}
        <div className={s.body} dangerouslySetInnerHTML={{ __html: article.html }} />

        <footer className={s.foot}>
          <a href={article.href} target="_blank" rel="noreferrer">Read this on Medium ↗</a>
          {article.tags.length > 0 && <p className={s.tags}>{article.tags.join(" · ")}</p>}
        </footer>

        {(previous || next) && (
          <nav className={s.pager} aria-label="Other writing">
            {previous ? (
              <a href={`/writing/${previous.id}`} className={s.pagerLink}>
                <span className={s.pagerLabel}>Previous</span>
                <span className={s.pagerTitle}>{previous.title}</span>
              </a>
            ) : <span />}
            {next && (
              <a href={`/writing/${next.id}`} className={`${s.pagerLink} ${s.pagerNext}`}>
                <span className={s.pagerLabel}>Next</span>
                <span className={s.pagerTitle}>{next.title}</span>
              </a>
            )}
          </nav>
        )}
      </article>
      <Footer />
    </>
  );
}
