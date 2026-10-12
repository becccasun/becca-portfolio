import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import { getBlogPosts, MEDIUM_URL } from "@/lib/blogs";
import s from "./writing.module.css";

export const metadata: Metadata = {
  title: "Writing · Rebecca Sun",
  description: "Writing about design, and about learning to build.",
};

// Read live from Medium (revalidated hourly), with a committed snapshot if the feed is down.
export default async function WritingPage() {
  const { posts } = await getBlogPosts();

  return (
    <>
      <Header />
      <main className={s.page}>
        <header className={s.head}>
          <h1 className={s.heading}>Writing about design, and about learning to build.</h1>
          <a href={MEDIUM_URL} target="_blank" rel="noreferrer" className={s.follow}>Follow on Medium ↗</a>
        </header>

        <ul className={s.list}>
          {posts.map((post) => (
            <li key={post.id}>
              <a href={`/writing/${post.id}`} className={s.row}>
                <span className={s.thumb}>
                  {post.image && <Image src={post.image} alt="" fill sizes="(max-width: 720px) 100vw, 200px" />}
                </span>
                <span className={s.body}>
                  {post.series && <span className={s.series}>{post.series}</span>}
                  <span className={s.title}>{post.title}</span>
                  <span className={s.excerpt}>{post.excerpt}</span>
                </span>
                <span className={s.detail}>
                  <time dateTime={post.date}>{post.dateLabel}</time>
                  <span>{post.minutes} min read</span>
                  {post.publication && <span>{post.publication}</span>}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
