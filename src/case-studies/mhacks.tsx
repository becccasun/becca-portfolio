import { Section, Subhead, Prose, Stats, Figure, Gallery } from "@/components/case/blocks";
import ScaledEmbed from "@/components/case/ScaledEmbed";
import WalletPass from "@/components/case/WalletPass";
import PosterGrid from "@/components/case/PosterGrid";
import type { CaseStudy } from "./types";

const img = (f: string) => `/work/mhacks/${f}`;

const sections = [
  { id: "overview", title: "Overview" },
  { id: "direction", title: "Direction" },
  { id: "consistency", title: "Consistency" },
  { id: "website", title: "Website" },
  { id: "games", title: "Mini games" },
  { id: "event", title: "Event day" },
  { id: "reflection", title: "Reflection" },
];

function Body() {
  return (
    <>
      <Section id="overview" title="One visual language, from the first poster to the final check">
        <Prose>
          <p>
            MHacks is the University of Michigan&apos;s hackathon. For the 2026 edition on October 3 and 4, I was the
            design lead on a team of four, and we built the brand from February all the way to the event itself. The
            scope kept growing as we got ahead of schedule, so the suite ended up covering a website, two mini games, a
            digital check-in pass, social posters, a printed banner, the stage deck, the hacker t-shirt and a giant
            prize check.
          </p>
          <p>
            I built the website on my own, and coded the boarding pass and bouquet builder with Claude Code before
            handing them to engineers. They connected the backend and databases, but left the frontend almost exactly
            as I designed it.
          </p>
        </Prose>
        <Figure src={img("hackers-tees.jpg")} alt="Four hackers wearing the MHacks 2026 t-shirt at their table" wide />
        <Stats
          items={[
            { value: "~2,000", label: "Applications" },
            { value: "800", label: "Accepted and RSVPed" },
            { value: "~600", label: "Hackers on site" },
            { value: "900", label: "T-shirts printed" },
          ]}
        />
      </Section>

      <Section id="direction" title="Michigan's flora, seen through the eyes of technology">
        <Prose>
          <p>
            We explored a few directions early on, from Bauhaus geometry to pattern-making and puzzles to soft
            gradients and flowers. The one we chose mixes technology with Michigan&apos;s flora. The apple blossom,
            Michigan&apos;s state flower, became the anchor because it tied most directly to the university. The tech
            side comes through ASCII and pixel art, so every flower looks like it&apos;s being rendered by a machine.
          </p>
        </Prose>
        <Figure src={img("banner.jpg")} alt="The MHacks 2026 banner: the wordmark over blurred pink and blue blossoms" wide />
      </Section>

      <Section id="consistency" title="Four designers stayed consistent by agreeing on why before what">
        <Prose>
          <p>
            The hardest part was keeping one brand across web, print, fabric, stage and social, with four designers at
            different levels. A strong reason for the theme mattered more than any rule. So the first thing we did was
            narrow the theme down and build a small asset library of the visuals we would use. We agreed that ASCII and
            flowers were our main visual language. I recommended tools like ArtKit CC to the team, and we only used
            photos from Michigan Commons, the university&apos;s royalty-free media library. After that, consistency came
            from giving feedback back and forth on every piece.
          </p>
          <p>
            Social posters were where that showed most. I designed many of them. Each series had its own job, from countdowns in pixel type to speaker
            reveals and sponsor thank-yous, but they all drew on the same blossoms, grids, screen textures and paper
            labels.
          </p>
        </Prose>
        <PosterGrid
          items={[
            { src: img("post-countdown.jpg"), alt: "Early applications close today, in pink pixel type" },
            { src: img("post-rsvps.jpg"), alt: "Early App RSVPs due today, decorated with bouquet stickers" },
            { src: img("post-speakers.jpg"), alt: "Speaker reveal for the co-founders of Beli" },
            { src: img("post-sponsors.jpg"), alt: "Thank you to our Thrive sponsors" },
            { src: img("post-festifall.jpg"), alt: "MHacks at Festifall, on a blue CRT screen" },
            { src: img("post-thanks.jpg"), alt: "Thank you to hackers, sponsors, judges, volunteers and the MHacks team" },
          ]}
        />
      </Section>

      <Section id="website" title="The website hides the garden behind an ASCII lens">
        <Prose>
          <p>
            I designed and built mhacks.org myself. The hero is a blurred photo of a garden. Moving your cursor drags a
            small lens across it that reveals the scene as a grid of ASCII dots, like looking at nature through a
            machine. Below the hero, sections stack and slide over each other as you scroll.
          </p>
        </Prose>
        <ScaledEmbed src="https://www.mhacks.org/" title="mhacks.org" poster={img("site-hero.jpg")} />
      </Section>

      <Section id="games" title="Two mini games gave every hacker something of their own">
        <Subhead>A boarding pass to share once you&apos;re in</Subhead>
        <Prose>
          <p>
            Both games were for marketing. Accepted hackers could make their own virtual boarding pass, with their name,
            departure city, backdrop, typeface and a bouquet sticker, then download it to post on social media. Every
            share announced MHacks to their followers.
          </p>
        </Prose>
        <ScaledEmbed src="https://becccasun.github.io/mhacks-ticket-2026/" title="MHacks 2026 boarding pass" poster={img("poster-ticket.jpg")} />

        <Subhead>A bouquet that ends up on the big screen</Subhead>
        <Prose>
          <p>
            The bouquet builder lets anyone arrange Michigan wildflowers in a vase and keep it as a die-cut sticker. My
            teammate drew the flowers and vases, and I turned them into a working experience. During the hackathon,
            people&apos;s bouquets decorated the slide deck and the live site, which gave the event a small personal
            touch.
          </p>
        </Prose>
        <ScaledEmbed src="https://becccasun.github.io/mhacks-bouquet/" title="MHacks bouquet builder" poster={img("poster-bouquet.jpg")} />
        <Figure src={img("bouquets.jpg")} alt="Six bouquet stickers made by hackers" wide />
      </Section>

      <Section id="event" title="On the day, the brand was on everything hackers touched">
        <Subhead>A pass for check-in and every meal</Subhead>
        <Prose>
          <p>
            Every hacker carried a branded Apple Wallet pass. It got them through check-in and was
            scanned again for food throughout the weekend.
          </p>
        </Prose>
        <WalletPass
          bg={img("pass-bg.jpg")}
          logo={img("pass-logo.png")}
          logoText="MHacks"
          header={{ label: "Oct 3", value: "9:00 AM" }}
          primary={{ label: "Date", value: "October 3-4th" }}
          secondary={{ label: "Name", value: "First Last" }}
          qr={img("pass-qr.svg")}
        />

        <Subhead>900 t-shirts</Subhead>
        <Prose>
          <p>
            I designed the hacker t-shirt: a dithered plant next to the line &ldquo;grow beyond the
            comprehensible&rdquo; and a hand-drawn MHacks wordmark. We printed around 900 of them, and I handed many out
            myself.
          </p>
        </Prose>
        <Figure src={img("tee-handout.jpg")} alt="Rebecca handing out MHacks t-shirts to a line of hackers" caption="Me handing out the T-shirts to the hackers." wide />

        <Subhead>A stage deck and a check worth a photo</Subhead>
        <Prose>
          <p>
            I designed the slide deck for the event, from the opening speakers to the prize announcements. For the
            winners, a teammate designed the check and I gave feedback. Then I glued the prints onto foam boards, so each
            check came out 40 by 80 inches: big enough to feel like a moment on stage and in every photo afterwards.
          </p>
        </Prose>
        <Gallery>
          <Figure src={img("beli-talk.jpg")} alt="The co-founders of Beli speaking on stage in front of the opening speaker slide" />
          <Figure src={img("figma-slide.jpg")} alt="Figma Student Ambassadors presenting the Best Design track slide" />
        </Gallery>
        <Figure src={img("check.jpg")} alt="Two winners holding the giant MHacks 2026 $5,000 check on stage" wide />
      </Section>

      <Section id="reflection" title="Consistency comes from a shared reason, not a rulebook">
        <Prose>
          <p>
            <strong>Agree on why before you design anything.</strong> With four designers at different levels, the
            asset library and the shared idea of tech meeting Michigan flora did more for consistency than any checklist
            could. It let people make their own calls and still land in the same world.
          </p>
          <p>
            <strong>Designing in code shortens the handoff.</strong> Because I built the website and games myself,
            engineers only had to connect the backend. What hackers used was what I designed.
          </p>
          <p>
            <strong>A brand gets stronger when people can make it their own.</strong> The boarding passes and bouquets
            turned hackers into contributors, and their work ended up on social media, on the slides and on the live
            site.
          </p>
          <p>Event photos by Soyeon Kim.</p>
        </Prose>
      </Section>
    </>
  );
}

export const mhacks: CaseStudy = {
  meta: {
    slug: "mhacks",
    title: "MHacks Design Suite",
    cover: img("banner.jpg"),
    concept: "Give Michigan's hackathon one visual language, flowers rendered through technology, that carried from the first poster to the final check.",
    role: ["Design Lead"],
    duration: ["9 months", "Feb to Oct 2026"],
    scope: ["Brand identity", "Website", "Interactive games", "Print and merch"],
    tools: ["Figma", "Photoshop", "Next.js", "Claude Code"],
    sections,
  },
  Body,
};
