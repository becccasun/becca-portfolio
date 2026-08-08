import fs from "fs";
import path from "path";
import matter from "gray-matter";

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
  sections: WorkSection[];
  /** Slug of the umbrella project this sits under (e.g. "loop"). */
  parent?: string;
  /** Short label for the project rail; falls back to the title. */
  projectLabel?: string;
  /** Where the project stands, shown on the hub index card. */
  status?: string;
  /** Populated by getTopLevelWork(); how many sub-projects live under this. */
  childCount?: number;
};

const WORK_DIR = path.join(process.cwd(), "content", "work");

export const MAX_TAGS = 3;

function toMeta(slug: string, data: Record<string, unknown>): WorkMeta {
  return {
    slug,
    title: (data.title as string) ?? slug,
    subtitle: (data.subtitle as string) ?? "",
    year: (data.year as string) ?? "",
    role: (data.role as string) ?? "",
    // Three is the ceiling by design: past that the pills stop reading as
    // labels and start reading as a list. Enforced here so no template
    // has to remember it.
    tags: ((data.tags as string[]) ?? []).slice(0, MAX_TAGS),
    tier: ((data.tier as 1 | 2) ?? 2) as 1 | 2,
    order: (data.order as number) ?? 99,
    category: ((data.category as WorkCategory) ?? "personal") as WorkCategory,
    cover: data.cover as string | undefined,
    sections: (data.sections as WorkSection[]) ?? [],
    parent: data.parent as string | undefined,
    projectLabel: data.projectLabel as string | undefined,
    status: data.status as string | undefined,
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
