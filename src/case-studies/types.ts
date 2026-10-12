import type { ComponentType } from "react";

// One case study: the header facts plus a Body component written with the blocks in
// components/case/blocks. `sections` drives the contents list; each id must match a
// <Section id> in the Body.
export type CaseMeta = {
  slug: string;
  title: string;
  cover?: string;
  /** "contain" shows the whole cover on `coverBg` instead of cropping it to fill */
  coverFit?: "contain";
  coverBg?: string;
  concept?: string;
  role: string[];
  duration: string[];
  scope: string[];
  // Fourth fact column: Toolkit when `tools` is set, otherwise Outcome.
  outcome?: string[];
  tools?: string[];
  /** a link out shown under the facts, e.g. the live prototype */
  link?: { label: string; href: string };
  sections: { id: string; title: string }[];
};

export type CaseStudy = { meta: CaseMeta; Body: ComponentType };
