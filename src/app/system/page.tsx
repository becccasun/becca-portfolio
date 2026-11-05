import type { Metadata } from "next";
import { readTokens, type Token } from "@/design-system/tokens/read";
import { withBase } from "@/lib/base";
import {
  Button, IconButton, NavLink, Chip, Tag, Eyebrow, StepNumber, Mark, OptionCard, Stat, Well, WorkCard, Slip,
  ChatQuestion, ChatReply, TextField, Text, type TextVariant,
} from "@/design-system";
import { Paper, Grain, Stamp, decor } from "@/design-system/decor";
import { works, stamps } from "@/content";
import s from "./system.module.css";

// The design system's living reference: every token in src/design-system/tokens, every
// component and decor piece, in each state. Unlisted, like the class-only case pages.
export const metadata: Metadata = { title: "Design System · Rebecca Sun", robots: { index: false, follow: false } };

const TYPE: { variant: TextVariant; figma: string; spec: string; sample: string }[] = [
  { variant: "display", figma: "Display", spec: "60 / 72 · -1.2", sample: "Artful experiences" },
  { variant: "heading-1", figma: "Heading/1", spec: "40 / 48 · -1.2", sample: "Loop Client Onboarding" },
  { variant: "heading-2", figma: "Heading/2", spec: "30 / 39 · -0.6", sample: "Rebecca is a full-stack designer" },
  { variant: "heading-3", figma: "Heading/3", spec: "28 / 34 · -0.56", sample: "Design MCP + Agentic Design System" },
  { variant: "quote", figma: "Quote", spec: "24 / 31 · -0.48", sample: "I just want to see my money move." },
  { variant: "lead", figma: "Lead", spec: "20 / 28 · -0.4", sample: "Twenty-three interviews, one question" },
  { variant: "body-large", figma: "Body/Large", spec: "17 / 27 · -0.17", sample: "Case-study prose sits at seventeen pixels on twenty-seven." },
  { variant: "body", figma: "Body/Default", spec: "16 / 23.2 · -0.32", sample: "Everyday copy, nav links and buttons." },
  { variant: "ui", figma: "UI/Default", spec: "15 / 22", sample: "Tables, option names, legends" },
  { variant: "ui-medium", figma: "UI/Medium", spec: "15 / 22 · 500", sample: "Option names" },
  { variant: "small", figma: "Small/Default", spec: "14 / 20", sample: "Captions, kickers, contents list" },
  { variant: "small-light", figma: "Small/Light", spec: "14 / 16.8 · 300", sample: "Work card blurbs" },
  { variant: "caption", figma: "Caption", spec: "13 / 18", sample: "Chips, footer links, slips" },
  { variant: "micro", figma: "Micro/Default", spec: "12 / 16", sample: "Overlay tags and step numbers" },
  { variant: "micro-strong", figma: "Micro/Strong", spec: "12 / 16 · 600", sample: "Mark numbers" },
  { variant: "eyebrow", figma: "Eyebrow", spec: "12 / 16 · 0.08em caps", sample: "Role · Duration · Scope" },
  { variant: "tag", figma: "Tag", spec: "11 / 14 · 500", sample: "Chosen" },
];

const isColor = (t: Token) => /^(#|rgb|var\(--(white|black|gray|red|green|blue|orange|cream|khaki|yellow|olive|sticky|button|ink\b))/.test(t.value) && !t.name.endsWith("-rgb");

export default function SystemPage() {
  const groups = readTokens();
  const colors = groups.filter((g) => g.tokens.some(isColor));
  const get = (title: string) => groups.find((g) => g.title === title)?.tokens ?? [];
  const work = works[0];

  return (
    <main className={s.page}>
      <header className={s.intro}>
        <Eyebrow>Design system</Eyebrow>
        <h1 className={s.h1}>Tokens and components</h1>
        <p className={s.lede}>
          Everything the portfolio is drawn with. Tokens live in <code>src/design-system/tokens</code>, components and layout in{" "}
          <code>src/design-system</code>, decor in <code>src/design-system/decor</code>. All of it is mirrored in the Figma file.
        </p>
      </header>

      <section className={s.section}>
        <h2 className={s.h2}>Color</h2>
        {colors.map((g) => (
          <div key={g.title} className={s.group}>
            <h3 className={s.h3}>{g.title}</h3>
            <ul className={s.swatches}>
              {g.tokens.filter(isColor).map((t) => (
                <li key={t.name} className={s.swatch}>
                  <span className={s.chipColor} style={{ background: `var(${t.name})` }} />
                  <code>{t.name}</code>
                  <small>{t.note ?? t.value}</small>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>Type</h2>
        <p className={s.note}>Figtree throughout. Tracking tightens as size grows; 15px and below sit at 0. Use <code>{"<Text variant>"}</code>; each variant is a Figma text style.</p>
        <ul className={s.typeList}>
          {TYPE.map((t) => (
            <li key={t.variant} className={s.typeRow}>
              <span className={s.typeMeta}><code>{t.variant}</code><small>{t.figma} · {t.spec}</small></span>
              <Text variant={t.variant} as="span">{t.sample}</Text>
            </li>
          ))}
        </ul>
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>Spacing</h2>
        <ul className={s.scale}>
          {get("Spacing").map((t) => (
            <li key={t.name}><span className={s.bar} style={{ width: `var(${t.name})` }} /><code>{t.name}</code></li>
          ))}
        </ul>
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>Radius</h2>
        <ul className={s.tiles}>
          {get("Radius").map((t) => (
            <li key={t.name}><span className={s.radius} style={{ borderRadius: `var(${t.name})` }} /><code>{t.name}</code><small>{t.note}</small></li>
          ))}
        </ul>
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>Elevation</h2>
        <ul className={s.tiles}>
          {get("Elevation").map((t) => (
            <li key={t.name}><span className={s.shadow} style={{ boxShadow: `var(${t.name})` }} /><code>{t.name}</code></li>
          ))}
        </ul>
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>Components</h2>

        <Spec title="Button" note="pill lg is the primary action, pill sm sits in compact rows, rect md links out of a case study.">
          <Button>Let&apos;s talk</Button>
          <Button size="sm">Send</Button>
          <Button size="sm" disabled>Send</Button>
          <Button shape="rect" size="md">View live prototype ↗</Button>
        </Spec>

        <Spec title="Icon button">
          <IconButton aria-label="Previous">←</IconButton>
          <IconButton aria-label="Next">→</IconButton>
          <span className={s.darkBox}><IconButton onDark aria-label="Close">✕</IconButton></span>
        </Spec>

        <Spec title="Nav link">
          <NavLink href="#" current>Work</NavLink>
          <NavLink href="#">About</NavLink>
          <NavLink href="#">Play</NavLink>
        </Spec>

        <Spec title="Chip">
          <Chip>What does Rebecca do?</Chip>
          <Chip>Show me her best project</Chip>
        </Spec>

        <Spec title="Tag">
          <Tag>Chosen</Tag>
          <span className={s.imgBox}><Tag variant="overlay">Before</Tag></span>
        </Spec>

        <Spec title="Step number and mark" note="Red marks friction in old or others' designs; green marks choices that work.">
          <StepNumber n={1} active />
          <StepNumber n={2} />
          <Mark n={1} />
          <Mark n={2} tone="good" />
          <span className={s.imgBox}><Mark n={3} pinned /></span>
        </Spec>

        <Spec title="Text field">
          <TextField placeholder="Amount" />
          <TextField defaultValue="120%" invalid />
        </Spec>

        <Spec title="Option card" wide>
          <OptionCard name="Stepper" note="One screen per decision; slower but nothing is missed." chosen />
          <OptionCard name="Single form" note="Everything at once; fast for experts, a wall for everyone else." />
        </Spec>

        <Spec title="Stat" wide>
          <Stat value="23 → 9 min" label="Time to onboard" />
          <Stat value="114" label="Components" />
          <Stat value="5x" label="Faster handoff" />
        </Spec>

        <Spec title="Work card and well" wide>
          <div className={s.workBox}>
            <WorkCard image={withBase(work.image)} kicker={work.kicker} title={work.title} blurb={work.blurb} />
          </div>
          <Well className={s.wellBox}><div className={s.wellEmpty}>Media slot</div></Well>
        </Spec>

        <Spec title="Slip and chat">
          <Slip body="Your stamps made my day. Keep painting!" name="A visitor" tilt={-1.5} />
          <Slip body="Thanks for stopping by." name="Rebecca" tilt={1} />
          <div className={s.chatBox}>
            <ChatQuestion>What is she working on?</ChatQuestion>
            <ChatReply>Right now: an agent harness for video editors at Aspect, and this design system.</ChatReply>
          </div>
        </Spec>
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>Decor</h2>
        <p className={s.note}>The handmade layer, from <code>@/design-system/decor</code>. New pieces start from Paper and Grain and read <code>tokens/decor.css</code>.</p>

        <Spec title="Paper" note="kind: slip, sticky, letter, placeholder, stamp, dark. tilt in degrees, grain for texture." wide>
          <Paper kind="slip" tilt={-1}><Text variant="caption">A slip of paper</Text></Paper>
          <Paper kind="sticky" tilt={1.5}><Text variant="ui-medium" tone="inherit">Sticky note</Text></Paper>
          <Paper kind="letter" grain style={{ padding: "var(--space-32)" }}><Text variant="lead">Dear visitor,</Text></Paper>
          <Paper kind="dark" grain><Text variant="caption" tone="on-dark">Charcoal paper</Text></Paper>
        </Spec>

        <Spec title="Placeholder stamp and stamp">
          <Paper kind="placeholder" tilt={4} />
          <span className={s.stampBox}><Stamp data={stamps[0]} index={0} /></span>
          <span className={s.grainBox}><Grain /></span>
        </Spec>

        <div className={s.spec}>
          <div className={s.specHead}><h3 className={s.h3}>Catalog</h3><p className={s.note}>Everything in <code>decor/catalog.ts</code>. Add a row when you add a piece.</p></div>
          <ul className={s.catalog}>
            {decor.map((d) => (
              <li key={d.name}>
                <span className={s.catalogHead}><Text variant="ui-medium" as="span">{d.name}</Text><Tag variant={d.status === "shipped" ? "solid" : "overlay"}>{d.status}</Tag></span>
                <Text variant="small" tone="soft">{d.what}</Text>
                <Text variant="micro" tone="muted">{[d.where, d.code].filter(Boolean).join(" · ")}</Text>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

function Spec({ title, note, wide, children }: { title: string; note?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={s.spec}>
      <div className={s.specHead}><h3 className={s.h3}>{title}</h3>{note && <p className={s.note}>{note}</p>}</div>
      <div className={wide ? s.specGrid : s.specRow}>{children}</div>
    </div>
  );
}
