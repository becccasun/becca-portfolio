import { Section, Subhead, Prose, Stats, Decision, Figure } from "@/components/case/blocks";
import Slideshow from "@/components/case/Slideshow";
import type { CaseStudy } from "./types";

const img = (f: string) => `/work/agentmail/${f}`;
const VIEW = 1440 / 1047;
const STAGE = "rgb(28, 28, 28)";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "brief", title: "The brief" },
  { id: "audience", title: "Audience" },
  { id: "views", title: "Three views" },
  { id: "details", title: "Details" },
  { id: "build", title: "Build" },
  { id: "reflection", title: "Reflection" },
];

function Body() {
  return (
    <>
      <Section id="overview" title="AgentMail wanted visitors to watch an agent send email in real time">
        <Prose>
          <p>
            AgentMail is a YC S25 startup that gives AI agents their own email inboxes. Developers use its API to
            create inboxes and send, receive and reply to messages in code. The product is powerful, but an API is
            hard to show off on a landing page.
          </p>
          <p>
            In Fall 2025, AgentMail asked our team at Atlas Digital, a consulting group at the University of
            Michigan, to build an interactive demo for their site: something visitors could watch think, act and
            email on its own. I joined as the product designer and designed the screens and layout of the frontend in
            a two-week sprint.
          </p>
        </Prose>
        <Figure src={img("demo.gif")} alt="The AgentMail demo switching between the User, System and Client views" wide />
        <Stats
          items={[
            { value: "2 weeks", label: "Design sprint before the midpoint" },
            { value: "3", label: "Views in one demo" },
            { value: "7", label: "People on the team" },
          ]}
        />
      </Section>

      <Section id="brief" title="The team realised they needed a designer two weeks before the midpoint">
        <Prose>
          <p>
            The team started out thinking the project didn&apos;t need a designer. Their first ideas were practical
            agents, like a sales rep that routes emails and a quote agent that replies to requests. Then they
            pivoted: the demo needed to show a fully autonomous agent, and it should put the spotlight on the API,
            sending and receiving email at scale, rather than on any one use case.
          </p>
          <p>
            The new idea was a short, playful storyline in the spirit of The Office. You&apos;re an overworked
            salesperson at a paper company, and you launch an agent to do your outreach for you. Two weeks before the
            midpoint, the team realised someone had to turn that into screens, and I was brought in.
          </p>
          <p>
            The story was mostly set by then. I helped choose the busy salesperson as the person the demo speaks to.
            The rest was mine to decide: who the demo was really for, which views to show, and what happens in each.
          </p>
        </Prose>
      </Section>

      <Section id="audience" title="I designed for busy people who don't speak AI">
        <Prose>
          <p>
            With such a narrow scope, everything came down to knowing exactly who I was serving. The people watching
            this demo aren&apos;t necessarily developers. They&apos;re busy, they want something to take work off their
            plate, and they don&apos;t have much AI fluency. They also need to trust it enough to hand over their inbox.
          </p>
          <p>
            So the question became: how do we make sure people aren&apos;t put off by the idea of AI emailing for them?
            My answer was to introduce it slowly, through things they already know: an inbox that looks like Gmail, a
            message from a manager, and code shown as a simple card rather than a wall of terminal output.
          </p>
        </Prose>
      </Section>

      <Section id="views" title="One demo, seen from the salesperson, the system and the lead">
        <Prose>
          <p>
            My first proposal was a step-by-step walkthrough: the user&apos;s first prompt, then AgentMail picking it up,
            then how the system works, and finally the result. The team helped me sharpen that into three
            perspectives on the same moment, the person sending, the system doing the work, and the lead receiving
            the email. A toggle lets visitors switch between them.
          </p>
        </Prose>
        <Decision
          chose="Three perspectives"
          options={[
            { name: "A step-by-step walkthrough", note: "Prompt, AgentMail, how it works, result. Clear, but it reads like a tutorial and makes visitors wait for the payoff." },
            { name: "Three perspectives", note: "User, system and client side by side behind one toggle. Visitors pick what they care about and see both ends of every email." },
          ]}
        />
        <Slideshow
          ratio="16 / 11"
          slides={[
            {
              label: "User",
              src: img("view-user.jpg"),
              ar: VIEW,
              bg: STAGE,
              pins: [{ x: 62.5, y: 37.4 }, { x: 17.6, y: 49.7 }, { x: 33.2, y: 56 }, { x: 35.1, y: 58.9 }, { x: 37.2, y: 68.8 }],
              note: {
                title: "The salesperson",
                points: [
                  "A liquid-glass toggle to switch perspectives",
                  "A banner says whose view you're in",
                  "The manager's message sets the goal",
                  "SDK cards hint at the tech underneath",
                  "A familiar inbox, so it still feels like yours",
                ],
              },
            },
            {
              label: "System",
              src: img("view-system.jpg"),
              ar: VIEW,
              bg: STAGE,
              pins: [{ x: 17, y: 49.7 }, { x: 40.5, y: 64.8 }, { x: 35.1, y: 74.3 }],
              note: {
                title: "AgentMail at work",
                points: [
                  "The banner explains the engine behind the outreach",
                  "Agent emails land in a real inbox, beside everything else",
                  "SDK cards stay in view on every tab",
                ],
              },
            },
            {
              label: "Client",
              src: img("view-client.jpg"),
              ar: VIEW,
              bg: STAGE,
              pins: [{ x: 18.5, y: 49.7 }, { x: 54.7, y: 69.8 }, { x: 38.3, y: 91.1 }],
              note: {
                title: "The lead",
                points: [
                  "The banner switches to the person receiving the email",
                  "A complete, personal email, not a template",
                  "Reply and forward, like any real conversation",
                ],
              },
            },
          ]}
        />
      </Section>

      <Section id="details" title="Every detail leaned on something people already know">
        <Subhead>Liquid glass for a product on the frontier</Subhead>
        <Prose>
          <p>
            AgentMail&apos;s brand is about efficiency: automating email and finding leads is ergonomic, fast and
            technical. Handing your outreach to AI is about as modern as it gets, so I used liquid glass for the
            toggle and the banners to carry that feeling into the interface.
          </p>
        </Prose>

        <Subhead>A message from the manager to start the story</Subhead>
        <Prose>
          <p>
            Before anything happens, a notification from your manager tells you to reach 50 sales over email by the end of the day.
            It&apos;s there purely for storytelling, so visitors immediately understand what they&apos;re looking at and
            whose shoes they&apos;re in.
          </p>
        </Prose>

        <Subhead>SDK cards instead of a terminal</Subhead>
        <Prose>
          <p>
            The original pitch had a scrolling terminal of live API logs. For people who aren&apos;t very technical,
            that&apos;s noise. Short SDK cards say the same thing in a friendlier way: there&apos;s serious technology
            behind this, it&apos;s been thought through, and you can rely on it.
          </p>
        </Prose>

        <Subhead>A Gmail-style inbox to keep people in control</Subhead>
        <Prose>
          <p>
            Showing the agent&apos;s work inside an inbox that looks like Gmail tells people their mailbox is still
            theirs. The AI works inside a space they already understand, instead of off somewhere they can&apos;t see.
          </p>
        </Prose>
      </Section>

      <Section id="build" title="The shipped frontend stayed close to the Figma">
        <Prose>
          <p>
            After the midpoint, the engineers built the demo in React with Framer Motion animations, following my
            screens closely. Testing the build surfaced two problems. Generating many emails took time, so visitors
            sat waiting, and it wasn&apos;t always clear when to click or where the flow went next.
          </p>
          <p>
            The team cut the wait by generating all the emails in one API call instead of one per email, adding an
            exit timeout, and giving the loading agent more buffer time.
          </p>
          <p>
            The demo ran on AgentMail&apos;s marketing site for a while, until they refreshed the site and replaced it
            for strategic reasons, which is normal for a startup moving this fast.
          </p>
        </Prose>
      </Section>

      <Section id="reflection" title="A narrow brief made me get specific about who I was designing for">
        <Prose>
          <p>
            <strong>Know exactly who you&apos;re serving.</strong> With only a demo to design, there was no room for a
            vague audience. Pinning down a busy, non-technical person who wants help but needs to trust it shaped
            every decision, from the inbox to the code cards.
          </p>
          <p>
            <strong>Introduce new things through familiar ones.</strong> People accept AI more easily when it shows up
            in places they already know. Gmail, a manager&apos;s message and a simple code card did more to build trust
            than explaining the technology would have.
          </p>
          <p>
            <strong>Going straight to high fidelity can work.</strong> With two weeks and a story already set, I went
            directly to high-fidelity screens. It worked here because the hard decisions were about perspective and
            tone, which are easier to judge on finished screens.
          </p>
          <p>
            <strong>Design for the system, not just the component.</strong> I introduced new elements like liquid glass,
            which really meant changes to whatever design system AgentMail was working from. They were likely building
            most of their site in Cursor without an established system, so there was little to align with. Looking
            back, the ideal handoff would have paired the demo with a short design guideline for their marketing
            pages, so the new pieces could live on after the demo itself was replaced.
          </p>
        </Prose>
      </Section>
    </>
  );
}

export const agentmail: CaseStudy = {
  meta: {
    slug: "agentmail",
    title: "AgentMail Product Demo",
    cover: img("cover.png"),
    coverFit: "contain",
    coverBg: "rgb(236, 236, 236)",
    concept: "Make an AI email agent feel familiar enough that busy, non-technical people would trust it with their inbox.",
    role: ["Product Designer", "UI/UX"],
    duration: ["2-week sprint", "Fall 2025"],
    scope: ["Interaction design", "Visual design", "Demo storytelling"],
    tools: ["Figma", "Framer Motion", "GSAP"],
    sections,
  },
  Body,
};
