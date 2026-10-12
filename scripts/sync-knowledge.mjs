// Copies Rebecca's case studies and about notes out of the portfolio rebuild so the
// chat mascot answers from the same material the case-study pages render.
//
//   npm run sync-knowledge                       (reads ~/rebecca-portfolio)
//   PORTFOLIO_DIR=/path/to/repo npm run sync-knowledge
//
// Writes:
//   src/knowledge/knowledge.json — everything the model is briefed with (server only)
//   src/knowledge/projects.json  — card metadata the panel shows (shipped to the browser)
//   src/knowledge/site.json      — name and email for the panel's footer (shipped to the browser)
//   public/knowledge/*           — the cover images those cards use
//
// Unfilled placeholders are left out on purpose: a "(Replace: …)" line or a case study
// still "Awaiting real case-study content" is not something the mascot should repeat.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";

const SRC = process.env.PORTFOLIO_DIR ?? path.join(os.homedir(), "rebecca-portfolio");
const OUT = path.resolve("src/knowledge");
const PUBLIC = path.resolve("public/knowledge");

if (!fs.existsSync(path.join(SRC, "content", "work"))) {
  console.error(`No content/work in ${SRC}. Set PORTFOLIO_DIR to the portfolio rebuild.`);
  process.exit(1);
}

const stripMdx = (s) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/\{[^}]*\}/g, " ")
    .replace(/[#*_`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// ---- about notes: drop comments, placeholder lines, and headings left empty ----
function cleanAbout(md) {
  // A placeholder is a whole "(Replace …)" block, and it can wrap onto several lines.
  const lines = md
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\(Replace\b[^)]*\)/gi, "")
    .split("\n");
  const kept = [];
  for (const line of lines) {
    if (/^A:\s*$/.test(line.trim())) {
      // an answer that was only a placeholder takes its question with it
      if (kept.length && /^Q:/.test(kept[kept.length - 1].trim())) kept.pop();
      continue;
    }
    kept.push(line);
  }
  // remove headings whose section is now empty
  const out = [];
  for (let i = 0; i < kept.length; i++) {
    if (/^##\s/.test(kept[i])) {
      let j = i + 1;
      while (j < kept.length && !kept[j].trim()) j++;
      if (j >= kept.length || /^##\s/.test(kept[j])) continue;
    }
    out.push(kept[i]);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

const agentDir = path.join(SRC, "content", "agent");
const about = fs.existsSync(agentDir)
  ? fs
      .readdirSync(agentDir)
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((f) => cleanAbout(fs.readFileSync(path.join(agentDir, f), "utf8")))
      .filter(Boolean)
      .join("\n\n")
  : "";

// ---- site details + timeline (site.ts is plain TS, which Node 24 imports directly) ----
let site = { name: "Rebecca Sun", email: "" };
let timeline = [];
try {
  const mod = await import(pathToFileURL(path.join(SRC, "src", "lib", "site.ts")).href);
  site = { name: mod.SITE?.name ?? site.name, email: mod.SITE?.email ?? "" };
  timeline = (mod.TIMELINE ?? []).map(({ date, title, detail }) => ({ date, title, detail }));
} catch (e) {
  console.warn("Could not read src/lib/site.ts (timeline and email left empty):", e.message);
}

// ---- case studies ----
fs.mkdirSync(OUT, { recursive: true });
fs.rmSync(PUBLIC, { recursive: true, force: true });
fs.mkdirSync(PUBLIC, { recursive: true });

const workDir = path.join(SRC, "content", "work");
const projects = [];
const skipped = [];
for (const file of fs.readdirSync(workDir).filter((f) => f.endsWith(".mdx")).sort()) {
  const slug = file.replace(/\.mdx$/, "");
  const { data, content } = matter(fs.readFileSync(path.join(workDir, file), "utf8"));
  if (/^Awaiting\b/i.test(data.subtitle ?? "")) {
    skipped.push(slug);
    continue;
  }
  let cover = null;
  if (data.cover) {
    const from = path.join(SRC, "public", data.cover.replace(/^\//, ""));
    if (fs.existsSync(from)) {
      const name = `${slug}${path.extname(from)}`;
      fs.copyFileSync(from, path.join(PUBLIC, name));
      cover = `/knowledge/${name}`;
    }
  }
  projects.push({
    slug,
    title: data.title,
    subtitle: data.subtitle ?? "",
    year: String(data.year ?? ""),
    role: data.role ?? "",
    status: data.status ?? "",
    scope: data.scope ?? [],
    outcome: data.outcome ?? [],
    tags: data.tags ?? [],
    cover,
    body: stripMdx(content),
  });
}

fs.writeFileSync(path.join(OUT, "knowledge.json"), JSON.stringify({ site, timeline, about, projects }, null, 2));
// name + email for the panel's footer, so the browser never has to load the full briefing
fs.writeFileSync(path.join(OUT, "site.json"), JSON.stringify(site, null, 2));
fs.writeFileSync(
  path.join(OUT, "projects.json"),
  JSON.stringify(
    projects.map(({ slug, title, subtitle, year, role, cover }) => ({ slug, title, subtitle, year, role, cover })),
    null,
    2,
  ),
);

console.log(`Synced ${projects.length} case studies from ${SRC}` + (skipped.length ? ` (skipped placeholders: ${skipped.join(", ")})` : ""));
console.log(`About notes: ${about ? `${about.split("\n").length} lines` : "none"}; timeline: ${timeline.length} entries`);
