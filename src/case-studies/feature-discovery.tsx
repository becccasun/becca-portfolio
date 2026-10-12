import { Section, Subhead, Prose, Table, Annotated, Stats, Decision, Figure, Quote } from "@/components/case/blocks";
import RainbowGrid from "@/components/case/RainbowGrid";
import type { CaseStudy } from "./types";
import { withBase } from "@/lib/base";

const img = (f: string) => withBase(`/work/feature-discovery/${f}`);

const sections = [
  { id: "overview", title: "Overview" },
  { id: "focus", title: "Focus" },
  { id: "method", title: "Method" },
  { id: "synthesis", title: "Synthesis" },
  { id: "findings", title: "Findings" },
  { id: "competitors", title: "Competitors" },
  { id: "heuristics", title: "Heuristics" },
  { id: "recommendations", title: "Recommendations" },
  { id: "outcome", title: "Outcome" },
  { id: "reflection", title: "Reflection" },
];

// Participants coded on the rainbow sheet, and a selection of its rows.
const people = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P13", "P14", "P15", "P16", "P17", "P19"];
const rainbow = [
  {
    title: "Installing in the terminal",
    rows: [
      { label: "Copied the install command from the website", hits: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P13", "P14", "P15", "P16", "P17"] },
      { label: "Felt sure the install had finished", hits: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P9", "P10", "P11", "P13", "P14", "P16", "P17"] },
      { label: "Couldn't find or run Embedder afterwards", hits: ["P1", "P8", "P9", "P11", "P15"] },
      { label: "Restarted the terminal to get it working", hits: ["P1", "P6", "P9", "P10", "P11", "P15"] },
    ],
  },
  {
    title: "Installing in VS Code",
    rows: [
      { label: "Went to the website to find the extension", hits: ["P1", "P2", "P4", "P5", "P6", "P9", "P10", "P13", "P15", "P19"] },
      { label: "Unsure which Embedder extension to install", hits: ["P3", "P7", "P8", "P9", "P10", "P17"] },
    ],
  },
  {
    title: "First use",
    rows: [
      { label: "Prompted the chat in simple, basic language", hits: ["P2", "P3", "P5", "P7", "P8", "P9", "P10", "P11", "P13", "P14", "P15", "P16", "P19"] },
      { label: "Didn't notice the Act / Plan / Debug toggle", hits: ["P2", "P3", "P8", "P9", "P10", "P11", "P13", "P15", "P16", "P17", "P19"] },
      { label: "Didn't notice the command menu", hits: ["P2", "P3", "P4", "P7", "P9", "P10", "P11", "P13", "P15", "P19"] },
      { label: "Typed a question for the AI into the console", hits: ["P4", "P10", "P11", "P15"] },
      { label: "Said they'd have missed features without help", hits: ["P5", "P6", "P8", "P14", "P15"] },
    ],
  },
];

function Body() {
  return (
    <>
      <Section id="overview" title="A YC startup whose best features were hiding behind its setup">
        <Prose>
          <p>
            Embedder is a YC S25 startup building an AI coding agent for embedded and firmware development. It runs in
            the terminal and as a VS Code extension, reads datasheets, and can build, flash and monitor a connected
            board. Think Cursor, but for firmware.
          </p>
          <p>
            In Winter 2026 I led a six-person research team through Atlas Digital, a consulting group at the University
            of Michigan, working with Embedder&apos;s CEO, Ethan Gibbs, and their head of product. Over ten weeks we ran
            23 hour-long usability interviews, a heuristic evaluation and a competitor analysis, then handed over seven
            design recommendations backed by coded data.
          </p>
        </Prose>
        <Figure src={img("console-running.jpg")} alt="Embedder in VS Code: the chat on the left and the Embedder Console streaming serial output" wide />
        <Stats
          items={[
            { value: "23", label: "Hour-long usability interviews" },
            { value: "30%", label: "Ran Embedder on the first try" },
            { value: "73%", label: "Misread the console's purpose" },
            { value: "7", label: "Design recommendations" },
          ]}
        />
      </Section>

      <Section id="focus" title="I narrowed a broad brief down to the first five minutes">
        <Prose>
          <p>
            The founders came to us with a long list: debugging, a hardware debug mode they were considering, whether
            people understood the value of the product, and a target of 50 to 100 participants. I suggested we pick
            one thing and do it well: the first five minutes, from installing Embedder in the terminal or VS Code to
            getting a first useful answer.
          </p>
          <p>
            There were two reasons. We had no hardware to test with, so we couldn&apos;t fairly test flashing or live
            debugging. And our team&apos;s strength was UI and UX, not hardware bring-up. A specific focus would give
            Embedder something they could act on, where a broad one would give them a pile of opinions.
          </p>
        </Prose>
        <Decision
          chose="The first five minutes"
          options={[
            { name: "Debugging and simulation", note: "Closest to Embedder's core value, but it needs real boards and hardware experience our team didn't have." },
            { name: "Value proposition", note: "Worth knowing, but hard to test until people actually have the tool running." },
            { name: "The first five minutes", note: "Installation, onboarding and feature discovery. Testable without hardware, and every user has to get through it first." },
          ]}
        />
      </Section>

      <Section id="method" title="We chose depth over volume once the answers started repeating">
        <Prose>
          <p>
            After 10 to 15 interviews, the answers started to overlap. Rather than chase the 50 to 100 number in the
            brief, we put the time into depth. Each session ran about an hour and started with the participant&apos;s
            own projects and tools before moving into think-aloud tasks. We finished with 23 interviews, mostly
            computer engineering and computer science students, with about a fifth of them working engineers.
          </p>
        </Prose>
        <Table
          head={["Task", "What we watched for"]}
          rows={[
            ["Install in the terminal", "Could they copy the command, finish the install and run Embedder?"],
            ["Install the VS Code extension", "Could they find the right extension and open it?"],
            ["First use", "Did they find the chat, console, modes and commands, and understand what each one was for?"],
          ]}
        />
        <Prose>
          <p>
            Alongside the interviews, we ran a competitor analysis against Claude Code, Codex and Cursor, and a
            heuristic evaluation of Embedder in both the terminal and VS Code.
          </p>
        </Prose>
      </Section>

      <Section id="synthesis" title="Every session went onto one rainbow sheet">
        <Prose>
          <p>
            Each researcher wrote up think-aloud notes, then we coded every session onto a shared rainbow sheet: a row
            for each behaviour, a column for each participant. Patterns showed up as solid bands of colour and the
            outliers showed up as gaps. These are some of the rows that shaped the findings.
          </p>
        </Prose>
        <RainbowGrid people={people} groups={rainbow} />
      </Section>

      <Section id="findings" title="People got stuck before they ever saw what Embedder could do">
        <Subhead>Installation lost half of them</Subhead>
        <Prose>
          <p>
            Only 30% got Embedder running on the first try. Half hit installation problems: a quarter couldn&apos;t
            install at all, and another quarter got there after errors like &ldquo;command not found&rdquo;, PATH
            issues and antivirus software deleting the file. 60% didn&apos;t read the instructions printed in the
            terminal, including the one telling them to restart it.
          </p>
        </Prose>
        <Quote by="P1">Even if they just add it to the note, like &ldquo;just restart your terminal,&rdquo; I think that&apos;s totally good.</Quote>

        <Subhead>The console looked like the main interface</Subhead>
        <Prose>
          <p>
            73% didn&apos;t understand what the Embedder Console was for at first. It opens next to the terminal and
            shows serial output from the board, but some people tried to chat in it and others closed it as clutter.
          </p>
        </Prose>
        <Quote by="P10">I think &lsquo;Embedder Monitor&rsquo; is a bit misleading. At first, I wasn&apos;t sure what it was and even thought it might be the main interface.</Quote>

        <Subhead>The best features stayed hidden</Subhead>
        <Prose>
          <p>
            Over 60% never found slash commands, mode switching or file attachments. Most didn&apos;t notice the
            Act, Plan and Debug toggle, and Act mode was on by default with no explanation of what it would do.
          </p>
        </Prose>
        <Quote by="P5">I also didn&apos;t really know about the commands or attachments, so maybe a tooltip or a shout-out saying, hey, we have these features as well.</Quote>

        <Subhead>Two ways to install, two extensions to choose from</Subhead>
        <Prose>
          <p>
            Preferences split between VS Code and the terminal, so both paths matter. In VS Code, the marketplace
            listed two Embedder extensions, and several people weren&apos;t sure which one was real.
          </p>
        </Prose>

        <Subhead>It read as another Claude wrapper</Subhead>
        <Prose>
          <p>
            Every participant compared Embedder to Copilot, Claude or Cursor. People called it a &ldquo;Claude
            wrapper&rdquo; and &ldquo;just a chat box&rdquo;, something they could put together themselves. Without a
            clear first impression of what made it different for firmware, they judged it as a general coding
            assistant.
          </p>
        </Prose>
        <Quote by="P12">What about this makes it inherently better than something like Claude Code? Are there any benchmarks you can point to?</Quote>
      </Section>

      <Section id="competitors" title="Next to Claude Code, Codex and Cursor, Embedder's difference was invisible">
        <Prose>
          <p>
            Embedder came to us with a brand problem they could feel but not yet measure. Their product sat in the
            same tools, with the same chat-and-agent layout, as Claude Code, Codex and Cursor, and they wanted to
            know how people actually saw Embedder next to them.
          </p>
          <p>
            So alongside the interviews, each researcher took one product and we compared all four across the same
            12 categories, from interaction model and context handling to system feedback and unique strength. We
            weighted the four that shape a first impression most: interaction model, input efficiency, context
            handling and system feedback.
          </p>
          <p>
            The comparison explained the brand dilution. There&apos;s no widely used AI agent built for firmware, so
            engineers default to general tools and bring those expectations with them. Embedder&apos;s real advantage
            is hardware context: datasheets, board selection, flashing and serial output. But that advantage lived in
            exactly the parts people found confusing in the first five minutes, like platform setup and the monitor.
            Everything people understood instantly looked like every other agent.
          </p>
        </Prose>
        <Table
          head={["First five minutes", "Embedder", "Claude Code, Codex and Cursor"]}
          rows={[
            ["Setup", "Extra hardware steps (platform, peripherals) on top of a normal agent install", "A standard install and sign-in, with nothing hardware-specific"],
            ["Next steps", "Unclear after setup; people weren't sure what to ask or how to phrase it", "Cursor surfaces suggestions and actions; the CLIs lean on habits people already have"],
            ["Modes", "Act, Plan and Debug cycle through a small button", "Cursor uses a dropdown, the pattern people expected"],
            ["What sets it apart", "Hardware context, but hidden behind the confusing parts", "Familiar, so people judged Embedder against them"],
          ]}
        />
      </Section>

      <Section id="heuristics" title="A keyboard-first tool that kept asking for the mouse">
        <Prose>
          <p>
            We evaluated Embedder in the terminal and in VS Code against Nielsen&apos;s 10 heuristics, plus two of our
            own for AI tools: AI transparency, and mouse versus keyboard. We rated every issue on Nielsen&apos;s 1 to 4
            severity scale.
          </p>
          <p>
            It found the same problems from another angle. Embedder&apos;s users live on the keyboard, but key
            controls only worked with a mouse. The loading indicator sat far from where people were typing, so they
            sent duplicate prompts thinking nothing was happening. Approval prompts could scroll out of view while
            the agent kept working, and internal labels like &ldquo;Todo Write&rdquo; showed up where a plain status
            should be.
          </p>
        </Prose>
        <Stats
          items={[
            { value: "12", label: "Heuristics, across terminal and VS Code" },
            { value: "56", label: "Issues logged" },
            { value: "18", label: "Rated major" },
            { value: "2", label: "Rated critical, both mouse-only controls" },
          ]}
        />
        <Annotated
          src={img("console-empty.jpg")}
          alt="Embedder in VS Code right after setup, with an empty console and chat"
          marks={[
            { x: 58.3, y: 54.6, note: "The Embedder Console sits beside the terminal with no explanation, so people read it as the place to chat." },
            { x: 33.9, y: 59, note: "Filter, Clear and permission prompts only work with a mouse." },
            { x: 11.3, y: 88.5, note: "The empty chat offers a single example prompt, with no hint of what else Embedder can do." },
            { x: 20, y: 94.2, note: "Act mode is on by default, and the command menu is a single slash. Most people never noticed either one." },
          ]}
        />
      </Section>

      <Section id="recommendations" title="Seven recommendations, each tied to something we saw">
        <Table
          head={["", "Recommendation", "Why"]}
          rows={[
            ["01", "Guided onboarding in VS Code, plus a walkthrough video", "Onboarding after install was unclear, and 73% didn't understand the console"],
            ["02", "Separate “Send to device” from “Ask Embedder”", "People typed questions for the AI into the serial console"],
            ["03", "Keyboard navigation and a command palette", "Mouse-only controls in a keyboard-first tool"],
            ["04", "A consistent design system that matches familiar tools", "Controls behaved differently from the IDEs people already use"],
            ["05", "Clearer terminal install steps, including the restart", "50% hit install issues and 60% skipped the terminal instructions"],
            ["06", "Suggested prompts in the empty chat", "Over 60% never found commands, modes or attachments"],
            ["07", "Make the two marketplace extensions easy to tell apart", "People weren't sure which extension to install"],
          ]}
        />
        <Quote by="P14">When I first opened the extension I was a little lost as to what I should do first. Maybe if there were some options I could click on, it would give me a starting point.</Quote>
      </Section>

      <Section id="outcome" title="The data showed Embedder which fixes were quick wins">
        <Prose>
          <p>
            The team already had questions about their interface going in, but they needed data before acting on
            them. Our interviews gave them that. Not every recommendation was built, but together they helped the
            team spot the low-hanging fruit: changes they could make quickly that would make a real difference.
            They also told us they valued that every recommendation came with numbers behind it, along with the
            full transcripts, recordings, coded data and competitor analysis.
          </p>
          <p>
            Since the handoff, Embedder has replaced the browser redirects that linked the terminal, VS Code and a
            web account with verification codes. The redirects had been one of the more error-prone steps in setup.
            They&apos;ve also changed some of the language in the interface based on our recommendations. For example,
            the Embedder Console is now called the Embedder Monitor.
          </p>
          <p>
            They also asked for our read on their marketing site and how well it got across the product, its key
            features and the brand. They have since rebuilt the whole site, and we gave input on the final design.
          </p>
        </Prose>
      </Section>

      <Section id="reflection" title="What I'd take into the next study">
        <Prose>
          <p>
            <strong>Narrowing the scope was the most useful call I made.</strong> Saying no to most of a client&apos;s
            brief felt risky, but a focused question is what made the findings specific enough to act on.
          </p>
          <p>
            <strong>Depth beat volume.</strong> Once answers started repeating, more sessions would only have added
            confidence to things we already knew. Longer sessions about people&apos;s own projects told us why they got
            stuck, not just where.
          </p>
          <p>
            <strong>Next time, I&apos;d bring hardware.</strong> Most of our participants were students and none of our
            team were hardware engineers, so we couldn&apos;t judge the parts of Embedder that matter most once someone
            is past setup. Recruiting more working firmware engineers would close that gap.
          </p>
        </Prose>
      </Section>
    </>
  );
}

export const featureDiscovery: CaseStudy = {
  meta: {
    slug: "feature-discovery",
    title: "Feature Discovery UX Research",
    cover: img("cover.png"),
    coverFit: "contain",
    coverBg: "#000",
    concept: "Before Embedder can show firmware engineers its best features, it has to get them through the first five minutes.",
    role: ["Lead User Researcher", "Project Manager"],
    duration: ["10 weeks", "Winter 2026"],
    scope: ["Usability testing", "Heuristic evaluation", "Competitor analysis", "Design recommendations"],
    tools: ["Zoom", "Google Sheets", "Figma"],
    sections,
  },
  Body,
};
