import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { playItems, type PlayItem } from "@/play";
import s from "./play.module.css";

export const metadata: Metadata = { title: "Play · Rebecca Sun" };

// Deal items into n columns, always onto the currently shortest one, so the columns end
// close to even while the order still reads left to right.
function columns(items: PlayItem[], n: number) {
  const cols: PlayItem[][] = Array.from({ length: n }, () => []);
  const heights = new Array(n).fill(0);
  for (const it of items) {
    const i = heights.indexOf(Math.min(...heights));
    cols[i].push(it);
    heights[i] += it.h / it.w;
  }
  return cols;
}

function Tile({ it }: { it: PlayItem }) {
  return (
    <figure className={s.tile} style={{ aspectRatio: `${it.w} / ${it.h}` }}>
      {it.type === "video" ? (
        <video src={it.src} autoPlay muted loop playsInline />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={it.src} alt={it.title} loading="lazy" />
      )}
      <figcaption className={s.caption}>
        <span className={s.title}>{it.title}</span>
        {it.note && <span className={s.note}>{it.note}</span>}
      </figcaption>
    </figure>
  );
}

function Grid({ n, className }: { n: number; className: string }) {
  return (
    <div className={className}>
      {columns(playItems, n).map((col, i) => (
        <div key={i} className={s.col}>
          {col.map((it) => <Tile key={it.src} it={it} />)}
        </div>
      ))}
    </div>
  );
}

export default function PlayPage() {
  return (
    <>
      <Header />
      <main className={s.page}>
        <h1 className={s.heading}>Play</h1>
        <Grid n={3} className={s.grid3} />
        <Grid n={2} className={s.grid2} />
      </main>
      <Footer />
    </>
  );
}
