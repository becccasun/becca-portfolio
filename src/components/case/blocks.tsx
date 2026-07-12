import styles from "./blocks.module.css";

/**
 * Composable media blocks for case-study MDX (spec item 8).
 * Prose stays in the reading column; media can opt into `wide`.
 */

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={styles.section}>
      <h2 className={`serif ${styles.sectionTitle}`}>{title}</h2>
      {children}
    </section>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return <div className={styles.prose}>{children}</div>;
}

export function Figure({
  src,
  alt = "",
  caption,
  wide = false,
}: {
  src: string;
  alt?: string;
  caption?: string;
  wide?: boolean;
}) {
  return (
    <figure className={`${styles.media} ${wide ? styles.wide : ""}`}>
      <div className={styles.well}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" />
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}

export function Video({
  src,
  caption,
  wide = false,
}: {
  src: string;
  caption?: string;
  wide?: boolean;
}) {
  return (
    <figure className={`${styles.media} ${wide ? styles.wide : ""}`}>
      <div className={styles.well}>
        <video src={src} autoPlay loop muted playsInline controls={false} />
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}

export function Gallery({
  images,
  caption,
  wide = true,
}: {
  images: { src: string; alt?: string }[];
  caption?: string;
  wide?: boolean;
}) {
  return (
    <figure className={`${styles.media} ${wide ? styles.wide : ""}`}>
      <div
        className={styles.gallery}
        style={{ gridTemplateColumns: `repeat(${images.length}, 1fr)` }}
      >
        {images.map((img) => (
          <div key={img.src} className={styles.well}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={img.alt ?? ""} loading="lazy" />
          </div>
        ))}
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}

export function PullQuote({
  children,
  attribution,
}: {
  children: React.ReactNode;
  attribution?: string;
}) {
  return (
    <blockquote className={styles.pullquote}>
      <p className="serif">{children}</p>
      {attribution && <cite>{attribution}</cite>}
    </blockquote>
  );
}

export function Spacer({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const heights = { sm: "var(--s-8)", md: "var(--s-16)", lg: "var(--s-24)" };
  return <div style={{ height: heights[size] }} aria-hidden="true" />;
}
