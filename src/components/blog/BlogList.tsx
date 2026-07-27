import Image from "next/image";
import Link from "next/link";
import { getBlogPosts, MEDIUM_URL } from "@/lib/blogs";
import styles from "./BlogList.module.css";

/**
 * Writing index, read live from Medium. A list rather than a grid,
 * because these are read in order and the title matters more than the
 * thumbnail.
 */
export default async function BlogList() {
  const { posts } = await getBlogPosts();

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1 className={`serif ${styles.title}`}>
          Writing about design, and about learning to build.
        </h1>
        <a
          href={MEDIUM_URL}
          target="_blank"
          rel="noreferrer"
          className={`link ${styles.follow}`}
          data-cursor-label="Medium"
        >
          Follow on Medium
        </a>
      </header>

      <ul className={styles.list}>
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/blogs/${post.id}`}
              className={styles.row}
              data-cursor-label="Read"
            >
              <span className={styles.thumb}>
                {post.image && (
                  <Image
                    src={post.image}
                    alt=""
                    fill
                    sizes="(max-width: 560px) 100vw, 160px"
                  />
                )}
              </span>

              <span className={styles.body}>
                {post.series && (
                  <span className={styles.series}>{post.series}</span>
                )}
                <span className={styles.name}>{post.title}</span>
                <span className={styles.excerpt}>{post.excerpt}</span>
              </span>

              <span className={styles.detail}>
                <time dateTime={post.date}>{post.dateLabel}</time>
                <span>{post.minutes} min read</span>
                {post.publication && (
                  <span className={styles.publication}>
                    {post.publication}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
