import type { CaseStudy } from "./types";
import { loopOnboarding } from "./loop-onboarding";
import { designMcp } from "./design-mcp";
import { featureDiscovery } from "./feature-discovery";
import { agentmail } from "./agentmail";
import { mhacks } from "./mhacks";
import { familyArchive } from "./family-archive";

// In homepage order. Swap a blankCase(...) for the project's own file once it's written.
export const caseStudies: CaseStudy[] = [
  loopOnboarding,
  featureDiscovery,
  designMcp,
  mhacks,
  agentmail,
];

// Shared by direct link only: never listed on the homepage, in the nav, the chat or next/prev links.
export const unlistedCases: CaseStudy[] = [familyArchive];

export const isUnlisted = (slug: string) => unlistedCases.some((c) => c.meta.slug === slug);

export const getCase = (slug: string) =>
  caseStudies.find((c) => c.meta.slug === slug) ?? unlistedCases.find((c) => c.meta.slug === slug);
