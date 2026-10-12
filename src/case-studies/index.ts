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
  designMcp,
  mhacks,
  agentmail,
  blankCase("editorial-journal", "Editorial Design Journal"),
];

export const getCase = (slug: string) => caseStudies.find((c) => c.meta.slug === slug);
