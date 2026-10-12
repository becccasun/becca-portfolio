import s from "./blocks.module.css";

// A small, chosen set of posts in a three-column grid, each at its own full resolution.
export default function PosterGrid({ items }: { items: { src: string; alt: string }[] }) {
  return (
    <figure className={`${s.media} ${s.wide}`}>
      <div className={s.posterGrid}>
        {items.map((it) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={it.src} src={it.src} alt={it.alt} loading="lazy" />
        ))}
      </div>
    </figure>
  );
}
