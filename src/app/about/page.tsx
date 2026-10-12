import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import s from "./about.module.css";

export const metadata: Metadata = { title: "About · Rebecca Sun" };

const photos = [
  { src: "/about/photo-rebecca.jpg", alt: "Rebecca holding a gingerbread toy beside a red mailbox" },
  { src: "/about/photo-lake.jpg", alt: "Three people on a dune above Lake Michigan" },
  { src: "/about/photo-love.jpg", alt: "Robert Indiana's LOVE painting in a gallery" },
];

const groups = [
  { src: "/about/card-atlas.png", alt: "Atlas Digital Technology Consulting Group, Project Manager and Product Designer" },
  { src: "/about/card-asquared.png", alt: "A/Squared Magazine, President and previous Vice President of Design" },
  { src: "/about/card-mhacks.png", alt: "MHacks, the University of Michigan hackathon, Designer" },
  { src: "/about/card-shift.png", alt: "SHIFT Creator Space, Creator" },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className={s.page}>
        <h1 className={s.heading}>About Me</h1>

        <div className={s.photos}>
          {photos.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.src} src={p.src} alt={p.alt} />
          ))}
        </div>

        <div className={s.copy}>
          <p>
            👋 I&apos;m a multidisciplinary design student at the University of Michigan, majoring in User Experience
            Design and double minoring in Architecture and Human-Centered Artificial Intelligence.
          </p>
          <p>
            Understanding how people respond to the products and experiences around them keeps me on my toes as a
            creative. Chasing that question has put me in a lot of seats on product teams, including designer, PM, and
            front-end developer, from YC Startups to self-initiated passion projects. Working across those roles pushes
            me to learn how products and features comes together from first idea to shipped feature, and how to keep
            stakeholders in sync along the way.
          </p>
          <p>
            In a past life, I was an aspiring architect. Moving between design methodologies has shaped how I think and
            make, and it taught me to treat reflection as part of the process. My ideas form through rapid iteration,
            each built on the last, and always centered on the people I&apos;m designing for.
          </p>
          <p>
            On campus, I direct A/Squared Magazine, a community of 60 student creators who come together to curate
            original arts, culture, and fashion print magazines. I also design for premiere tech and builder
            communities at Michigan, including Atlas Digital, MHacks, and SHIFT Creator Space.
          </p>
          <p className={s.ps}>
            P.S. If creative side-quests (building taste, learning tools) sound like an ideal way to spend a 5-9 to
            you, lets talk!
          </p>
        </div>

        <div className={s.groups}>
          {groups.map((g) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={g.src} src={g.src} alt={g.alt} loading="lazy" />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
