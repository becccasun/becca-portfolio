import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Reads the token files at build time, in index.css import order, so /system always
// shows what the site ships. Groups follow each file's "── Name ──" section comments.
export type Token = { name: string; value: string; note?: string };
export type TokenGroup = { title: string; tokens: Token[] };

const DIR = join(process.cwd(), "src/design-system/tokens");

export function readTokens(): TokenGroup[] {
  const files = [...readFileSync(join(DIR, "index.css"), "utf8").matchAll(/@import "\.\/(.+?)";/g)].map((m) => m[1]);
  const groups: TokenGroup[] = [];
  let current: TokenGroup | undefined;
  for (const line of files.flatMap((f) => readFileSync(join(DIR, f), "utf8").split("\n"))) {
    const head = line.match(/\/\* ── (?:\d\. )?(.+?) ─/);
    if (head) { current = { title: head[1].replace(/\s*\(.*\)$/, ""), tokens: [] }; groups.push(current); continue; }
    const sub = line.match(/^\s*\/\* ([a-z][a-z ,:]+?)(?: \(.*\))? \*\/\s*$/);
    if (sub && current && current.tokens.length) { current = { title: `${current.title.split(" · ")[0]} · ${sub[1]}`, tokens: [] }; groups.push(current); continue; }
    if (sub && current) { current.title = `${current.title.split(" · ")[0]} · ${sub[1]}`; continue; }
    for (const m of line.matchAll(/(--[\w-]+):\s*([^;]+);(?:\s*\/\* (.+?) \*\/)?/g)) {
      current?.tokens.push({ name: m[1], value: m[2].trim(), note: m[3] });
    }
  }
  return groups.filter((g) => g.tokens.length);
}
