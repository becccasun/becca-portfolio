import s from "./Footer.module.css";

// The live site's footer: a sign-off, two links, and an empty bottom-right corner
// where the chat mascot lands as the page reaches the end (see ChatMascot).
export default function Footer() {
  return (
    <footer className={s.footer} data-site-footer>
      <p className={s.signoff}>Designed with love <em>~ RS ⋆˚࿔</em></p>
      <nav className={s.links} aria-label="Contact">
        <a href="https://www.linkedin.com/in/beccasun/" target="_blank" rel="noreferrer">LINKEDIN</a>
        <a href="mailto:beccasun@umich.edu">EMAIL</a>
      </nav>
      <span className={s.slot} aria-hidden />
    </footer>
  );
}
