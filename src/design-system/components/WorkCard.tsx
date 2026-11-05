import s from "./WorkCard.module.css";

/** Home works grid card: 563:363 thumbnail, kicker, title, blurb. Figma: Work Card. */
export function WorkCard({ href, image, kicker, title, blurb }: { href?: string; image?: string; kicker?: string; title: string; blurb?: string }) {
  return (
    <a className={s.work} href={href}>
      {image ? <img className={s.thumb} src={image} alt="" /> : <span className={s.thumb} />}
      {kicker && <p className={s.kicker}>{kicker}</p>}
      <h3 className={s.title}>{title}</h3>
      {blurb && <p className={s.blurb}>{blurb}</p>}
    </a>
  );
}
