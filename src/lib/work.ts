import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { readImageSize } from "./image-size";

export type WorkSection = { id: string; title: string };

export const WORK_CATEGORIES = [
  { id: "personal", label: "Personal projects" },
  { id: "client", label: "Contract & client work" },
  { id: "hackathons", label: "Hackathons" },
  { id: "sprints", label: "Design sprints" },
] as const;

export type WorkCategory = (typeof WORK_CATEGORIES)[number]["id"];

export type WorkMeta = {
  slug: string;
  title: string;
  subtitle: string;
  year: string;
  role: string;
  tags: string[];
  tier: 1 | 2;
  order: number;
  category: WorkCategory;
  cover?: string;
  /**
   * Grid tile art, when it should differ from `cover`. `cover` doubles as
   * the case study's hero, so a project that wants its own tile image
   * without changing that hero sets this instead of overwriting it.
   */
  thumbnail?: string;
  /**
   * Silent clip that replaces the tile image while the pointer is on it.
   * Shot at the tile's own aspect ratio (see --thumb-ratio) and left at
   * preload="none", so it costs nothing until someone hovers.
   */
  thumbnailVideo?: string;
  sections: WorkSection[];
  /** Slug of the umbrella project this sits under (e.g. "loop"). */
  parent?: string;
  /** Short label for the project rail; falls back to the title. */
  projectLabel?: string;
  /** Where the project stands, shown on the hub index card. */
  status?: string;
  /** Populated by getTopLevelWork(); how many sub-projects live under this. */
  childCount?: number;
  /**
   * Intrinsic aspect ratio (width / height) of the tile's artwork,
   * measured off the file at build time. The bento grid lays tiles out
   * at their real shape and solves the two columns from these, so a
   * swapped-in image re-solves the layout with no frontmatter to edit.
   * Null when there is no art, or the format could not be read.
   */
  thumbRatio: number | null;

  /* --- Case-study header facts (see ProjectFacts) --------------------- */

  /** The central idea, in a sentence or two. Falls back to `subtitle`. */
  concept: string;
  /** `role` split into stacked lines. Frontmatter may give either. */
  roles: string[];
  /** How long the project ran, e.g. "Feb – Apr 2026". Falls back to `year`. */
  duration: string;
  /** Disciplines the project actually covered. */
  scope: string[];
  /** What it produced. Empty when the case study doesn't yet say. */
  outcome: string[];
  /** Live site or clickable prototype, when one exists publicly. */
  prototype?: { href: string; label: string; note?: string };
};

const WORK_DIR = path.join(process.cwd(), "content", "work");
const PUBLIC_DIR = path.join(process.cwd(), "public");

/**
 * Measured once per image per process. getAllWork() runs for every page
 * that lists work, and re-opening the same handful of files each time
 * is pure waste.
 */
const ratioCache = new Map<string, number | null>();

function thumbRatioFor(src?: string): number | null {
  if (!src || !src.startsWith("/")) return null;
  const cached = ratioCache.get(src);
  if (cached !== undefined) return cached;
  const size = readImageSize(path.join(PUBLIC_DIR, src));
  const ratio =
    size && size.height > 0 ? size.width / size.height : null;
  ratioCache.set(src, ratio);
  return ratio;
}

export const MAX_TAGS = 3;

/** Frontmatter may write a single string or a list; the header wants a list. */
function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function toMeta(slug: string, data: Record<string, unknown>): WorkMeta {
  const role = (data.role as string) ?? "";
  return {
    slug,
    title: (data.title as string) ?? slug,
    subtitle: (data.subtitle as string) ?? "",
    year: (data.year as string) ?? "",
    role,
    // Three is the ceiling by design: past that the pills stop reading as
    // labels and start reading as a list. Enforced here so no template
    // has to remember it.
    tags: ((data.tags as string[]) ?? []).slice(0, MAX_TAGS),
    tier: ((data.tier as 1 | 2) ?? 2) as 1 | 2,
    order: (data.order as number) ?? 99,
    category: ((data.category as WorkCategory) ?? "personal") as WorkCategory,
    cover: data.cover as string | undefined,
    thumbnail: data.thumbnail as string | undefined,
    thumbnailVideo: data.thumbnailVideo as string | undefined,
    sections: (data.sections as WorkSection[]) ?? [],
    parent: data.parent as string | undefined,
    projectLabel: data.projectLabel as string | undefined,
    status: data.status as string | undefined,

    concept: ((data.concept as string) ?? (data.subtitle as string) ?? "").trim(),
    roles: toList(data.roles ?? role),
    duration: ((data.duration as string) ?? (data.year as string) ?? "").trim(),
    scope: toList(data.scope),
    outcome: toList(data.outcome),
    prototype: data.prototype as WorkMeta["prototype"],
    // The grid draws `thumbnail ?? cover`, so measure whichever it will
    // actually show.
    thumbRatio: thumbRatioFor(
      (data.thumbnail as string | undefined) ??
        (data.cover as string | undefined)
    ),
  };
}

/** Every case study on disk, umbrella parents and their children alike. */
export function getAllWork(): WorkMeta[] {
  const files = fs.readdirSync(WORK_DIR).filter((f) => f.endsWith(".mdx"));
  const items = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(WORK_DIR, file), "utf8");
    const { data } = matter(raw);
    return toMeta(slug, data);
  });
  return items.sort((a, b) => a.order - b.order);
}

/**
 * What the home grid and the archive list: sub-projects are folded into
 * their parent, which carries a childCount so the tile can show the stack.
 */
export function getTopLevelWork(): WorkMeta[] {
  const all = getAllWork();
  return all
    .filter((w) => !w.parent)
    .map((w) => ({
      ...w,
      childCount: all.filter((c) => c.parent === w.slug).length,
    }));
}

/** Sub-projects under an umbrella, in frontmatter order. */
export function getChildren(slug: string): WorkMeta[] {
  return getAllWork().filter((w) => w.parent === slug);
}

/**
 * The project list a rail shows: for a child, its parent's children;
 * for an umbrella parent, its own children. Empty for standalone work.
 */
export function getSiblings(meta: WorkMeta): WorkMeta[] {
  return getChildren(meta.parent ?? meta.slug);
}

export function getWork(slug: string): { meta: WorkMeta; content: string } | null {
  const file = path.join(WORK_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return { meta: toMeta(slug, data), content };
}
