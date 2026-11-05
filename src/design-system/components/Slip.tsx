import s from "./Slip.module.css";

/** Message board note: a fortune-cookie slip with a slight lean (keep tilt within --tilt-slip). Figma: Slip (Author). */
export function Slip({ body, name, tilt = 0 }: { body: string; name: string; tilt?: number }) {
  return (
    <figure className={s.slip} style={{ rotate: `${tilt}deg` }}>
      <blockquote>{body}</blockquote>
      <figcaption>{name}</figcaption>
    </figure>
  );
}
