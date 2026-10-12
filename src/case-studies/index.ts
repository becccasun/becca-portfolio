import { blankCase } from "./template";
import type { CaseStudy } from "./types";
import { loopOnboarding } from "./loop-onboarding";
import { designMcp } from "./design-mcp";
import { featureDiscovery } from "./feature-discovery";
import { agentmail } from "./agentmail";
import { mhacks } from "./mhacks";

// In homepage order. Swap a blankCase(...) for the project's own file once it's written.
export const caseStudies: CaseStudy[] = [
  loopOnboarding,
  featureDiscovery,
  agentmail,
  designMcp,
  mhacks,
  blankCase("editorial-journal", "Editorial Design Journal"),
  blankCase("apology", "Apology: Living PRDs"),
  blankCase("sentinel", "Sentinel at Ramp Builders Cup"),
];

export const getCase = (slug: string) => caseStudies.find((c) => c.meta.slug === slug);
