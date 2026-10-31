import { Section, Subhead, Prose, Stats, Figure, Gallery, Quote } from "@/components/case/blocks";
import ScreenStepper from "@/components/case/ScreenStepper";
import Compare from "@/components/case/Compare";
import Slideshow from "@/components/case/Slideshow";
import ScaledEmbed from "@/components/case/ScaledEmbed";
import type { CaseStudy } from "./types";
import { withBase } from "@/lib/base";

// Unlisted: SI 407 midterm, shared by link only. Not in caseStudies, the homepage, nav or chat.
const img = (f: string) => withBase(`/work/family-archive/${f}`);
const PROTOTYPE = "https://becccasun.github.io/407-family-archive/";
const FIGMA =
  "https://www.figma.com/proto/kQOsj3PVLJjiutBR7OCL9q/SI-407---Bi-Weekly-Assignments---Rebecca-Sun?node-id=201-4191&starting-point-node-id=201%3A4191&page-id=201%3A4189";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "brief", title: "The brief" },
  { id: "research", title: "Research" },
  { id: "retheme", title: "Re-theming" },
  { id: "cuts", title: "What I cut" },
  { id: "navigation", title: "Navigation" },
  { id: "features", title: "Key features" },
  { id: "mobile", title: "Mobile" },
  { id: "prototype", title: "Prototype" },
  { id: "reflection", title: "Reflection" },
];

function Body() {
  return (
    <>
      <Section id="overview" title="A shop for the box of family photos nobody knows what to do with">
        <Prose>
          <p>
            The Family Archive is an online shop for archival kits, storage, scanning, digitizing and family-history
            books. It&apos;s made for people who just inherited boxes of old photos, letters and tapes, so they know
            where to start and feel okay sending in things they can&apos;t replace.
          </p>
          <p>
            This was my midterm for SI 407 at the University of Michigan, a one week sprint I did on my own. I designed
            a responsive site at 393px and 1512px (home, catalogue, product page, cart, checkout and a 404), the design
            system behind it, and a deck explaining my choices. Then I built it in HTML, CSS and JS so it can be
            clicked through for real.
          </p>
        </Prose>
        <Stats
          items={[
            { value: "1 week", label: "Solo sprint" },
            { value: "6", label: "Page types" },
            { value: "2", label: "Breakpoints, plus dark mode" },
            { value: "180", label: "Button variants" },
          ]}
        />
      </Section>

      <Section id="brief" title="The prompt was random, the people behind it weren't">
        <Prose>
          <p>
            Everyone in the class drew a business and a visual direction at random. I got The Family Archive, paired
            with Archival and Monochromatic: scanned documents, filing systems, black and white photography and catalog
            numbering.
          </p>
          <p>
            I pictured the shopper as someone around 35 to 60 who just inherited a pile of family photos, letters and
            tapes, often after a parent downsizes. They care a lot about it but they aren&apos;t archivists. Two things
            stop them: they don&apos;t know what to buy first, and they&apos;re scared to mail originals that only exist
            once.
          </p>
        </Prose>
        <Quote>
          How might we help people who&apos;ve inherited a pile of family photos, letters and tapes figure out what to
          buy or send in, trust us with their originals, and check out without feeling overwhelmed?
        </Quote>
      </Section>

      <Section id="research" title="Three shops showed me how to make a big job feel small">
        <Prose>
          <p>
            I looked at three sites that each solve part of this problem. Legacybox does the scanning side, Artifact
            Uprising sells photo books, and Gumroad isn&apos;t related at all but has a bold, bordered look I wanted to
            borrow for the cards.
          </p>
        </Prose>
        <Slideshow
          slides={[
            {
              label: "Legacybox",
              src: img("c-legacybox.jpg"),
              ar: 1440 / 800,
              bg: "#e9e9e9",
              note: {
                title: "One box makes a big job feel doable",
                points: [
                  "You don't sort anything first, you just fill the box",
                  "A simple how it works and order tracking answer \"is my stuff safe?\" early",
                ],
              },
            },
            {
              label: "Artifact Uprising",
              src: img("c-artifact-uprising.jpg"),
              ar: 1000 / 1280,
              bg: "#3f3a33",
              note: {
                title: "Warm photography does the selling",
                points: ["The product photos feel like a real home, not a studio", "Few options, so I gave kits just three sizes"],
              },
            },
            {
              label: "Gumroad",
              src: img("c-gumroad.jpg"),
              ar: 1440 / 800,
              bg: "#f4f4f0",
              note: {
                title: "Bold borders can still feel friendly",
                points: ["Flat color and thick outlines feel fun, not cold", "Bordered cards in a simple grid are easy to scan"],
              },
            },
          ]}
        />
      </Section>

      <Section id="retheme" title="Re-theming the whole system through variables, from blue to ink on paper">
        <Prose>
          <p>
            I didn&apos;t start from scratch. I started from the template I made for our earlier bi-weekly assignments,
            which was blue and pale green and a bit neubrutalist. Because every color, size and spacing value in it was
            already a variable, I could swap the theme in one place and the whole site followed.
          </p>
          <p>
            The new palette is ink #121212 on paper #F6F3EC, with five colors total: Ink, Paper, Archive Tan, Graphite,
            and Stamp Red, which only shows up for errors and sold out items. It also fixed a real problem. The old
            primary button was white on light blue at about 2.6:1, which fails contrast. Paper on ink is about 17:1.
          </p>
        </Prose>
        <Compare before={img("home-before.jpg")} after={img("home-after.jpg")} ratio="1512 / 840" />
        <Figure src={img("colors.jpg")} alt="The five colors: Ink, Paper, Archive Tan, Graphite and Stamp Red" wide />
        <Figure src={img("contrast.jpg")} alt="Contrast pairs for buttons, body text, captions and errors, all passing WCAG AA" wide />
      </Section>

      <Section id="cuts" title="I cut the details that only made sense to me">
        <Subhead>Three typefaces down to two</Subhead>
        <Prose>
          <p>
            My first pass used Newsreader for headlines, Figtree for body and IBM Plex Mono for labels. Three felt like
            too many voices for one small shop, so I dropped Figtree. Newsreader now does headlines and body, and reads
            a bit like an old letter. Plex Mono does labels, prices and buttons, like a typed file label.
          </p>
        </Prose>
        <Figure src={img("foundations-early.jpg")} alt="Early foundations with three typefaces and FA-K01 catalog numbers" wide />
        <Figure src={img("type.jpg")} alt="Final typefaces: Newsreader and IBM Plex Mono" wide />

        <Subhead>Catalog numbers, gone</Subhead>
        <Prose>
          <p>
            To lean into the archive idea, I first put catalog numbers like FA-K01 on every product, index numbers on
            every section, little eyebrow labels and &ldquo;Fig.&rdquo; captions under photos. When I looked at it as a
            shopper would, none of that meant anything. It was decoration that made people read more. So I took it all
            out and kept the archive feeling through the tone of the copy, the black and white photos and folder tab
            categories.
          </p>
        </Prose>
      </Section>

      <Section id="navigation" title="One catalogue instead of five little shops">
        <Prose>
          <p>
            My first nav had all five categories in the top bar: Kits, Scanning, Storage, Digitizing and Family Books.
            It felt like five separate stores, and there was no clear way back home. I changed it to Home, Catalogue and
            How it works, plus Saved and Cart. Catalogue opens a menu that splits things the way people actually think
            about them: Products you buy (Kits, Storage) and Services where you send things in (Scanning, Digitizing,
            Family Books).
          </p>
        </Prose>
        <Compare before={img("nav-before.jpg")} after={img("nav-after.jpg")} ratio="1512 / 811" />
      </Section>

      <Section id="features" title="Every step tells you what just happened and what's next">
        <Prose>
          <p>
            Product cards got three actions: Add to cart, Save, and Quick view so you can pick a size without leaving
            the catalogue. Early on, adding to cart only changed a tiny line of text, and it was easy to miss. Now a toast
            slides in with the item and a View cart button, and the cart count bumps. Saved items show up in the cart
            under Saved for later, so it&apos;s easy to come back to them.
          </p>
          <p>
            Checkout is one page with numbered sections instead of several steps, and errors show up inline next to the
            field, with a summary at the top. The 404 stays in character: &ldquo;404: Misfiled.&rdquo;
          </p>
        </Prose>
        <ScreenStepper
          steps={[
            { label: "Home", src: img("s-home.jpg") },
            { label: "Catalogue and filters", src: img("s-catalogue.jpg") },
            { label: "Quick view", src: img("s-quickview.jpg") },
            { label: "Product page", src: img("s-product.jpg") },
            { label: "Added to cart", src: img("s-added.jpg") },
            { label: "Cart and saved for later", src: img("s-cart.jpg") },
            { label: "Checkout", src: img("s-checkout.jpg") },
            { label: "Checkout errors", src: img("s-checkout-error.jpg") },
            { label: "Confirmation", src: img("s-confirmation.jpg") },
            { label: "404", src: img("s-404.jpg") },
          ]}
        />
      </Section>

      <Section id="mobile" title="On a phone, the same shop rearranges itself">
        <Prose>
          <p>
            On desktop the filters sit in a sidebar. On mobile they move into a bottom sheet, so the products get the
            whole screen. The order summary in checkout folds up so the form comes first. Every color has a light and
            dark value, so dark mode came along with the tokens instead of being a second design.
          </p>
        </Prose>
        <Gallery>
          <Figure src={img("m-home.jpg")} alt="Home on mobile" />
          <Figure src={img("m-filters.jpg")} alt="Filters in a bottom sheet on mobile" />
          <Figure src={img("m-product.jpg")} alt="Product page on mobile" />
          <Figure src={img("m-cart.jpg")} alt="Cart on mobile" />
        </Gallery>
      </Section>

      <Section id="prototype" title="A system you can click through, in Figma and in code">
        <Prose>
          <p>
            Everything in Figma is tokenized: color, type sizes and weights, a spacing scale, radius and effect styles.
            Components carry their states, from buttons (180 variants) to cards, inputs, filters and the toast. I built
            the same thing in HTML, CSS and JS on GitHub Pages, and there&apos;s also a{" "}
            <a href={FIGMA} target="_blank" rel="noreferrer">Figma prototype</a> of the full flow.
          </p>
        </Prose>
        <ScaledEmbed src={PROTOTYPE} title="The Family Archive prototype" poster={img("s-home.jpg")} width={1512} height={945} />
      </Section>

      <Section id="reflection" title="The theme should help the shopper, not just look the part">
        <Prose>
          <p>
            <strong>Variables paid off right away.</strong> Setting up my template with tokens for the bi-weeklies meant
            re-theming a whole site took an afternoon instead of a week.
          </p>
          <p>
            <strong>A visual direction is not a list of props.</strong> The catalog numbers were fun to design, but
            they made shoppers do more work. The archive feeling held up fine without them.
          </p>
          <p>
            <strong>Next time I&apos;d test with real people.</strong> I reviewed this as a shopper myself. I&apos;d like
            to sit with someone who actually just inherited a box of photos and watch where they hesitate.
          </p>
        </Prose>
      </Section>
    </>
  );
}

export const familyArchive: CaseStudy = {
  meta: {
    slug: "family-archive-x7k2",
    title: "The Family Archive",
    cover: img("cover.jpg"),
    coverFit: "contain",
    coverBg: "#E0D7C4",
    concept:
      "An online shop for archival kits, scanning, storage and family-history books, made so people who inherit boxes of family photos know where to start and trust us with their originals.",
    role: ["Product Designer"],
    duration: ["1 week sprint", "Fall 2026"],
    scope: ["Responsive E-commerce Site", "Design System", "Rationale Deck"],
    tools: ["Figma", "HTML, CSS and JS", "GitHub Pages"],
    link: { label: "View live prototype", href: PROTOTYPE },
    sections,
  },
  Body,
};
