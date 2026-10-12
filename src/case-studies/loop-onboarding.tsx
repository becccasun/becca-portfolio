import { Section, Subhead, Prose, Table, Annotated, Funnel, Stats, Decision, Gallery, Figure, Quote, LivePrototype } from "@/components/case/blocks";
import ScreenStepper from "@/components/case/ScreenStepper";
import Compare from "@/components/case/Compare";
import Slideshow from "@/components/case/Slideshow";
import type { CaseStudy } from "./types";
import { withBase } from "@/lib/base";

const img = (f: string) => withBase(`/work/loop-onboarding/${f}`);
const PROTOTYPE = "https://becccasun.github.io/loop-onboarding-demo/";
const SCREEN = "1383 / 868";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "old-flow", title: "The old flow" },
  { id: "problems", title: "What was going wrong" },
  { id: "research", title: "Research" },
  { id: "eligibility", title: "Eligibility first" },
  { id: "autofill", title: "Registry autofill" },
  { id: "contacts", title: "Business contacts" },
  { id: "guardrails", title: "Guardrails" },
  { id: "waiting-room", title: "The waiting room" },
  { id: "testing", title: "Testing" },
  { id: "process", title: "How I worked" },
  { id: "status", title: "Where it stands" },
  { id: "reflection", title: "Reflection" },
];

function Body() {
  return (
    <>
      <Section id="overview" title="Opening a business account takes more than a form">
        <Prose>
          <p>
            Loop is a Series A fintech that builds finance tools for Canadian small and medium-sized businesses:
            corporate cards, low FX rates, global accounts and expense management.
          </p>
          <p>
            Before a business can use any of that, it has to apply. Someone from the business fills in its details,
            its legal and ownership structure, tax ID, industry, what it sells, and its yearly revenue and spend. Then
            every key person (owners, directors, signing officers) verifies their identity. Loop&apos;s risk team runs
            a background check and a KYB/KYC review, and only after approval can the business open an account and
            apply for a credit limit.
          </p>
          <p>
            I was the only designer on the project, working with a product manager and three engineers over eight
            weeks. I also met often with the chief compliance officer, the risk team and customer service to find out
            where people were getting stuck. My job was to redesign the whole flow: the layout, the copy, and the
            logic of which questions get asked and when.
          </p>
        </Prose>
        <Stats
          items={[
            { value: "23 → 9 min", label: "Time to apply, in testing" },
            { value: "8 weeks", label: "From audit to approved design" },
            { value: "14", label: "Prototype versions" },
          ]}
        />
      </Section>

      <Section id="old-flow" title="One long form for every kind of business">
                <Prose>
          <p>
            The old application started with an identity verification prompt from Loop&apos;s vendor, AiPrise, then
            walked every applicant through the same six steps, whether they were a sole proprietor or a corporation
            with a parent company.
          </p>
        </Prose>
        <ScreenStepper
          steps={[
            { label: "Get started", src: img("old-0-verify-start.jpg") },
            { label: "Business information", src: img("old-1-business-info.jpg") },
            { label: "Business details", src: img("old-2-business-details.jpg") },
            { label: "Business address", src: img("old-3-business-address.jpg") },
            { label: "Business contacts", src: img("old-4-business-contacts.jpg") },
            { label: "Add a person", src: img("old-4-add-person.jpg") },
            { label: "Additional information", src: img("old-6-additional-info.jpg") },
            { label: "Submit", src: img("old-6-submit.jpg") },
          ]}
        />
      </Section>

      <Section id="problems" title="Where the application lost clarity, and applicants&apos; trust">
        <Prose>
          <p>
            The old version was cluttered, leaned on long text instructions, and was out of date: some compliance
            questions had been added since it was built, and some it still asked were no longer collected. On top
            of that, the contacts section was the number one thing customers complained about. Four problems came up
            again and again.
          </p>
        </Prose>

        <Subhead>1. Nothing checked what people typed</Subhead>
        <Annotated
          src={img("old-1-business-info-filled.jpg")}
          alt="Business information step with a made-up entity ID and tax ID filled in"
          marks={[
            { x: 60.5, y: 64, note: "Any business entity ID goes through, even one that is invalid or already in use. A typo or a bot with a random number reaches review." },
            { x: 60.5, y: 76.8, note: "The tax ID only shows an example. There is no feedback if the format is wrong." },
          ]}
        />

        <Subhead>2. Every business got every question</Subhead>
        <Annotated
          src={img("old-2-business-details.jpg")}
          alt="Business details step with the legal business structure options"
          marks={[
            { x: 36.8, y: 37.7, note: "A corporation and a sole proprietorship should lead to very different questions. Here the answer changes nothing, so a simple business still fills out everything." },
          ]}
        />

        <Subhead>3. The contacts page was a wall of text</Subhead>
        <Annotated
          src={img("old-4-business-contacts.jpg")}
          alt="Business contacts step with dense instructions"
          marks={[
            { x: 30.5, y: 30.5, note: "Who to add, how to add yourself and which roles to pick are all packed into one block of instructions, so it is hard to tell what the page is asking." },
            { x: 48.5, y: 70.8, note: "Many applicants didn't realise they had to add themselves as a key contact. The mistakes showed up later as wrong or badly formatted entries." },
          ]}
        />

        <Subhead>4. No guardrails on the details that matter</Subhead>
        <Annotated
          src={img("old-4-add-person.jpg")}
          alt="Add related person modal"
          marks={[
            { x: 31.5, y: 54.3, note: "Date of birth accepts any year, including 2026. Key people need to be at least 18." },
            { x: 31.5, y: 65, note: "Ownership percent accepts anything, so owners can add up to 120%." },
          ]}
        />

        <Table
          head={["Problem", "What the applicant sees", "What it costs Loop"]}
          rows={[
            ["No input validation", "Moves on with a typo and finds out days later", "Reviews stall on bad IDs; easier for bots to get through"],
            ["One flow for all", "Long form full of questions that don't apply", "Early drop-off"],
            ["Text-heavy contacts page", "Unsure who to add, including themselves", "Risk team corrects entries by hand"],
            ["No guardrails", "Can submit impossible answers", "Slower approvals and more back and forth"],
          ]}
        />
      </Section>

      <Section id="research" title="Applicants were finding out too late">
        <Subhead>Listening to the people closest to it</Subhead>
        <Prose>
          <ul>
            <li>
              <strong>Customer service</strong> said the biggest reason people dropped off was the amount of manual
              typing. Agents were often getting on calls to walk applicants through the form, which doesn&apos;t
              scale.
            </li>
            <li>
              <strong>Compliance</strong> owned the rules for who has to verify their identity and who needs to give
              an SIN or SSN. Most of it lived in long federal PDFs, and it changes with the type of business.
            </li>
            <li>
              <strong>Risk</strong> saw the other end: applications from businesses Loop could never serve, like
              restricted industries, pre-revenue companies or Quebec sole proprietorships, that only got turned down
              after the applicant had filled in everything.
            </li>
            <li>
              <strong>Clients.</strong> I sat in on three client calls. Loop&apos;s customer service team works
              closely with its clients, and they were happy to tell us what was confusing.
            </li>
          </ul>
          <p>
            For a fintech that runs on trust, finding out at the very end that you were never eligible is about the
            worst experience you can give someone.
          </p>
        </Prose>

        <Subhead>How other fintechs do it</Subhead>
        <Prose>
          <p>
            I signed up for real accounts at Mercury, Ramp (US and Canada), Float, Venn and Column, screenshotted every
            step and compared the patterns. Almost all of them screen for eligibility at the very start. Venn also
            checks the business number against the Canadian Business Registry while you type, and most of them show a
            step list with an estimated time up front. Loop had none of these.
          </p>
        </Prose>
        <Slideshow
          slides={[
            {
              label: "Ramp Canada",
              src: img("zoom-ramp.jpg?v=2"),
              ar: 1519 / 836,
              bg: "rgb(243, 241, 239)",
              pins: [{ x: 76.7, y: 36 }, { x: 49, y: 73.5 }],
              note: {
                title: "Errors you can't miss",
                points: ["Every missing field is flagged in place, in one colour", "Helper text says what to write before you get it wrong"],
              },
            },
            {
              label: "Mercury",
              src: img("zoom-mercury.jpg?v=3"),
              ar: 1507 / 824,
              bg: "rgb(214, 192, 221)",
              pins: [{ x: 16.7, y: 10.6 }, { x: 31, y: 19.7 }],
              note: {
                title: "Progress you can see, in small pieces",
                points: ["A progress bar runs across the top of every screen", "Each page only asks a handful of questions"],
              },
            },
            {
              label: "Float",
              src: img("zoom-float.jpg?v=2"),
              ar: 1922 / 959,
              bg: "rgb(228, 245, 253)",
              pins: [{ x: 47, y: 23.6 }, { x: 82, y: 20 }],
              noteAt: "left",
              note: {
                title: "Clean and short from the first screen",
                points: ["The pitch is three short lines", "One short form and nothing else on the screen"],
              },
            },
          ]}
        />

        <Subhead>Where applicants dropped out</Subhead>
        <Prose>
          <p>
            I pulled verification data from AiPrise to see where the funnel broke. Out of 364 sign-ups in the sample,
            fewer than half finished business verification, and only 18 reached the agreements step.
          </p>
        </Prose>
        <Funnel
          stages={[
            { label: "Signed up", value: 364 },
            { label: "Finished business verification", value: 158 },
            { label: "Reached agreements", value: 18 },
          ]}
        />
        <Stats
          items={[
            { value: "3.3 days", label: "Median wait for KYB review" },
            { value: "0", label: "Screens designed for that wait" },
          ]}
        />
      </Section>

      <Section id="eligibility" title="Telling businesses where they stand before they start">
                <Prose>
          <p>
            The team&apos;s first worry was that an eligibility check would make a long flow even longer: applicants
            would answer the eligibility questions and then still fill in all the business and ownership details
            after it. That worry shaped the rest of the design. Every answer in the check had to be reused later, so
            the check pays for itself.
          </p>
          <p>
            The final check isn&apos;t a single yes or no. Different answers lead to different outcomes:
          </p>
        </Prose>
        <Decision
          chose=""
          options={[
            { name: "Hard no", note: "Restricted industries such as cannabis, gambling or crypto, and Quebec sole proprietorships, end at a clear exit with a way to contact support." },
            { name: "Soft no", note: "Pre-revenue businesses aren't turned away. They're asked to show they're real and funded, for example a statement with at least $25,000 available." },
            { name: "Show us more", note: "Some structures need an extra document: proof of operations for sole proprietorships and partnerships, an ownership chart when there's a related business." },
          ]}
        />
        <ScreenStepper
          steps={[
            { label: "Minimum qualifications", src: img("new-start.jpg") },
            { label: "Search the registry", src: img("new-search.jpg") },
            { label: "Is this your business?", src: img("new-registry-confirm.jpg") },
            { label: "Website", src: img("new-website.jpg") },
            { label: "Monthly revenue", src: img("new-revenue.jpg") },
            { label: "Tax ID", src: img("new-tax-id.jpg") },
            { label: "A few last questions", src: img("new-last-questions.jpg") },
            { label: "You're eligible", src: img("new-eligible.jpg") },
          ]}
        />
        <Gallery>
          <Figure src={img("new-prerevenue-proof.jpg")} alt="Pre-revenue businesses are asked for proof of funding" />
          <Figure src={img("new-decline.jpg")} alt="Restricted industries see a clear exit" />
        </Gallery>
      </Section>

      <Section id="autofill" title="Letting the registry do the typing">
        <Subhead>Ask for the tax ID first, then do the work in the background</Subhead>
        <Prose>
          <p>
            One of the first things we ask for is the business&apos;s name or tax ID. While the applicant answers the
            rest of the eligibility questions, the backend looks the business up in the registry and pulls what it
            can: industry, size, address, registered directors and authorized signers. By the time they reach the
            application, those fields are already filled in. They review what&apos;s there and fill the few gaps,
            which are marked.
          </p>
          <p>
            This is what cut the time to apply by more than half, from 23 minutes to 9 in our testing. If a business
            isn&apos;t on the registry, for example because it&apos;s brand new, the flow falls back to a manual form.
          </p>
        </Prose>
        <Annotated
          tone="good"
          src={img("new-business-info.jpg")}
          alt="Business information step prefilled from the registry"
          marks={[
            { x: 28.5, y: 22.5, note: "The applicant already confirmed these details from the registry, so they're told they won't be asked again." },
            { x: 68.7, y: 87.6, note: "Only the gaps the registry couldn't fill are marked as required." },
          ]}
        />
      </Section>

      <Section id="contacts" title="Drawing ownership instead of describing it">
                <Prose>
          <p>
            The contacts step was the hardest part to understand, because who counts as a key contact depends on the
            kind of business. Under Canadian rules there has to be at least one authorized signer submitting the
            application. A corporation must list its directors, a trust has trustees and beneficiaries, and a sole
            proprietorship has a single proprietor. That&apos;s hard to picture from a paragraph of instructions.
          </p>
          <p>
            So the new page draws it. Your business sits at the top, people and related businesses branch off it, and
            directors found in the registry are already waiting to be added. The old flow kept people and related
            businesses on separate pages, which also meant there was no way to record a parent company that is itself
            an owner. Now a company can be an owner too.
          </p>
        </Prose>
        <Compare
          before={img("old-4-business-contacts.jpg")}
          after={img("new-contacts-tree.jpg")}
          beforeLabel="Before"
          afterLabel="After"
          ratio={SCREEN}
        />
        <Quote>In testing, this was one of the parts people understood best.</Quote>
        <Gallery>
          <Figure src={img("new-add-person.jpg")} alt="Edit related person modal with role descriptions" />
          <Figure src={img("new-contacts-added.jpg")} alt="Contacts tree with a director added" />
        </Gallery>
      </Section>

      <Section id="guardrails" title="Catching mistakes while people type">
                <Prose>
          <p>
            The CRA business number is checked as it&apos;s entered (nine digits and a valid checksum), birth dates
            have to make the person at least 18, and ownership shares are added up as you go. Documents are screened
            too: the page tells you exactly what to upload, and nothing at all if your answers already cover it.
          </p>
        </Prose>
        <Gallery>
          <Figure src={img("new-tax-id-invalid.jpg")} alt="Inline error for an invalid CRA business number" />
          <Figure src={img("new-documents.jpg")} alt="Documents step showing that no extra documents are needed" />
        </Gallery>
      </Section>

      <Section id="waiting-room" title="Turning the review wait into a head start">
        <Prose>
          <p>
            A lot of applicants submitted without finishing their identity verification and never came back, so their
            applications could never be approved. Most of the fintechs I looked at also leave the review period blank.
          </p>
          <p>
            We designed it assuming every applicant is a good fit and will be approved. After submitting, they land in
            a waiting room that shows where the application is and what they can do in the meantime: the required
            steps, plus things like applying for a credit line or scheduling a first deposit to link their bank
            account. That way, the moment they&apos;re approved, they can go straight into the dashboard and start
            using the account.
          </p>
          <p>
            Testing caught one problem here. People didn&apos;t realise the credit application stayed locked until they
            connected a bank account, so I added the connect button right inside the locked task and made the reason
            clearer.
          </p>
        </Prose>
        <Gallery>
          <Figure src={img("new-waitroom.jpg")} alt="Waiting room with application status and required actions" />
          <Figure src={img("new-waitroom-tasks.jpg")} alt="Optional tasks to speed up onboarding and identity verification status" />
        </Gallery>
      </Section>

      <Section id="testing" title="Fifteen people trying to break it">
        <Prose>
          <p>The design was tested in three ways:</p>
          <ul>
            <li>I sat with people from the growth and risk teams as they went through the new flow for the first time.</li>
            <li>We ran a make-and-break session where around 15 people across the company tried to break the prototype or find flaws in it.</li>
            <li>Select clients tried it, alongside internal stakeholders. That&apos;s where the 23-to-9-minute number comes from.</li>
          </ul>
          <p>
            The make-and-break session surfaced a lot of friction I hadn&apos;t accounted for, and the final design
            is better for it. I wrote everything up in a synthesis doc and worked through it in the next versions.
          </p>
        </Prose>
      </Section>

      <Section id="process" title="A prototype everyone could click through">
        <Prose>
          <p>
            Less than a week in, I started prototyping in HTML with Claude Code, built on the design system I was
            making at the same time. There was no PRD at first, so scope moved around. I kept strict versions of every
            prototype and deployed each one so anyone could click through the latest flow, and I took feedback at
            three stand-ups a week.
          </p>
          <p>
            The prototype became the source of truth for both the interface and the flow in every meeting about the
            project, including one with the CEO and the head of engineering about fitting the flow to policy and
            regulation. Over 14 versions it went from a single screen to the whole connected flow. When a page was
            about 80% there, I brought it into Figma with the Figma MCP and finished the details by hand before
            handing it to engineering with annotations.
          </p>
        </Prose>
        <Compare
          before={img("onboarding-v1.jpg")}
          after={img("onboarding-v3.jpg")}
          beforeLabel="V1.0"
          afterLabel="V3.7"
        />
        <LivePrototype
          src={PROTOTYPE}
          title="Loop onboarding prototype"
        />
      </Section>

      <Section id="status" title="Approved, and shipping in Q4">
        <Prose>
          <p>
            The design was approved for build and is set to ship to production in Q4 2026. There&apos;s no
            production data yet; the timing numbers come from testing with stakeholders and select clients.
          </p>
        </Prose>
      </Section>

      <Section id="reflection" title="What I&apos;d carry into the next one">
        <Prose>
          <p>
            <strong>Most of the friction wasn&apos;t the compliance questions themselves.</strong> Loop has to collect
            what it collects. What I could change was the order, the feedback, the branching and what happens after
            you hit submit.
          </p>
          <p>
            <strong>Design the wait, not just the form.</strong> A multi-day review is part of the product, and
            leaving it blank is where people were getting lost.
          </p>
          <p>
            <strong>Leave a trail.</strong> Next time I&apos;d document every change and every new decision as I go.
            Some choices, like a specific word or layout, aren&apos;t obvious, and whoever picks this up next
            deserves to know why they were made.
          </p>
          <p>
            <strong>Test more, and measure closer.</strong> I&apos;d run more usability tests on the final version,
            and set up tracking per question instead of per page. Today we can only see which page someone left on,
            not which question, which makes the smaller problems hard to find.
          </p>
        </Prose>
      </Section>
    </>
  );
}

export const loopOnboarding: CaseStudy = {
  meta: {
    slug: "loop-onboarding",
    title: "Loop Client Onboarding",
    cover: img("onboarding.jpg"),
    concept: "Bring clarity and trust to opening a fintech account through a redesigned flow and a UX refresh.",
    role: ["Sole Product Designer"],
    duration: ["8 weeks", "Summer 2026"],
    scope: ["End-to-end flow", "Conditional logic", "UX copy", "Prototyping"],
    tools: ["Claude Code", "Figma", "MCP", "Vercel"],
    link: { label: "Open the prototype", href: PROTOTYPE },
    sections,
  },
  Body,
};
