import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { SITE, TIMELINE } from "./site";

/**
 * Builds the grounded system prompt for /api/chat from the same MDX
 * files that render the site, so the bot can never drift from the
 * published work. Cached per server process.
 */

let cached: string | null = null;

function stripMdx(source: string): string {
  return source
    .replace(/<[^>]+>/g, " ")
    .replace(/\{[^}]*\}/g, " ")
    .replace(/[#*_`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildSystemPrompt(): string {
  if (cached) return cached;

  const workDir = path.join(process.cwd(), "content", "work");
  const projects = fs
    .readdirSync(workDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(workDir, file), "utf8");
      const { data, content } = matter(raw);
      return [
        `### ${data.title} (${data.year})`,
        `Role: ${data.role}`,
        `Summary: ${data.subtitle}`,
        stripMdx(content),
      ].join("\n");
    })
    .join("\n\n");

  const timeline = TIMELINE.map(
    (t) => `- ${t.date}: ${t.title}, ${t.detail}`
  ).join("\n");

  cached = `You are the assistant on ${SITE.name}'s portfolio site (${SITE.url}). Visitors are usually recruiters, designers, or engineers deciding whether to reach out.

Answer questions about Rebecca's work using ONLY the material below. Be concise, warm, and concrete; two short paragraphs at most. If asked something the material does not cover, say you only know what's on the site and suggest emailing ${SITE.email}. Never invent projects, employers, dates, or outcomes. Decline questions unrelated to Rebecca or her work politely and briefly.

## Experience timeline
${timeline}

## Case studies
${projects}`;

  return cached;
}
