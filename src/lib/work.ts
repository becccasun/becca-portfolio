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
};

const WORK_DIR = path.join(process.cwd(), "content", "work");

export function getAllWork(): WorkMeta[] {
  const files = fs.readdirSync(WORK_DIR).filter((f) => f.endsWith(".mdx"));
  const items = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(WORK_DIR, file), "utf8");
    const { data } = matter(raw);
    return {
      slug,
      title: data.title ?? slug,
      subtitle: data.subtitle ?? "",
      year: data.year ?? "",
      role: data.role ?? "",
      tags: data.tags ?? [],
      tier: (data.tier ?? 2) as 1 | 2,
      order: data.order ?? 99,
      category: (data.category ?? "personal") as WorkCategory,
      cover: data.cover,
      sections: data.sections ?? [],
    };
  });
  return items.sort((a, b) => a.order - b.order);
}

export function getWork(slug: string): { meta: WorkMeta; content: string } | null {
  const file = path.join(WORK_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return {
    meta: {
      slug,
      title: data.title ?? slug,
      subtitle: data.subtitle ?? "",
      year: data.year ?? "",
      role: data.role ?? "",
      tags: data.tags ?? [],
      tier: (data.tier ?? 2) as 1 | 2,
      order: data.order ?? 99,
      category: (data.category ?? "personal") as WorkCategory,
      cover: data.cover,
      sections: data.sections ?? [],
    },
    content,
  };
}
