import { BLOG_POSTS } from "@/lib/blogs";
import styles from "./BlogList.module.css";

/**
 * Writing index. A list rather than a grid, because these are read in
 * order and the title matters more than the thumbnail.
 */
export default function BlogList() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.added - a.added);

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1 className={`serif ${styles.title}`}>
          Writing about design, and about learning to build.
        </h1>
      </header>

      <ul className={styles.list}>
        {posts.map((post) => (
          <li key={post.id}>
            <a
              href={post.href}
              target="_blank"
              rel="noreferrer"
              className={styles.row}
              data-cursor-label={`Read on ${post.source}`}
            >
              <span className={styles.thumb}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image} alt="" loading="lazy" />
              </span>
              <span className={styles.body}>
                <span className={styles.name}>{post.title}</span>
                <span className={styles.blurb}>{post.blurb}</span>
              </span>
              <span className={styles.detail}>
                {post.source} · {post.year}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
