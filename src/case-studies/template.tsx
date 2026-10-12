import { Section, Subhead, Prose, Placeholder, Gallery } from "@/components/case/blocks";
import type { CaseStudy } from "./types";

// Blank case study. Every project starts from this and gets replaced piece by piece
// as it's written up.
export function blankCase(slug: string, title: string): CaseStudy {
  const sections = [1, 2, 3].map((n) => ({ id: `section-${n}`, title: `Section ${n}` }));

  function Body() {
    return (
      <>
        {sections.map((s, i) => (
          <Section key={s.id} id={s.id} title="Header">
            <Subhead>Subheader</Subhead>
            <Prose>
              <p>Body text. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
              <p>Body text. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            </Prose>
            {i === 1 ? (
              <Gallery>
                <Placeholder />
                <Placeholder />
              </Gallery>
            ) : (
              <Placeholder wide={i === 0} />
            )}
          </Section>
        ))}
      </>
    );
  }

  return {
    meta: {
      slug,
      title,
      concept: "Subheader",
      role: ["Role"],
      duration: ["Duration"],
      scope: ["Scope"],
      outcome: ["Outcome"],
      sections,
    },
    Body,
  };
}
