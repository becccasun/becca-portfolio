#!/usr/bin/env node
// Design-system check. Run it on the files a new screen adds:
//   node scripts/ds-check.mjs src/app/new-page            (a folder or files)
//   node scripts/ds-check.mjs                             (defaults to src/design-system and src/app/system)
// Fails on:   var(--x) that no token file defines, the file doesn't define, and has no fallback
// Warns on:   raw colors (#hex, rgb(), hsl()) outside the token files, and font-size in raw px
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const TOKENS = join(ROOT, "src/design-system/tokens");
const targets = process.argv.slice(2).length ? process.argv.slice(2) : ["src/design-system", "src/app/system"];

const walk = (p) => statSync(p).isDirectory() ? readdirSync(p).flatMap((f) => walk(join(p, f))) : [p];
const defined = new Set();
for (const f of walk(TOKENS).filter((f) => f.endsWith(".css"))) {
  for (const m of readFileSync(f, "utf8").matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1]);
}
// Set outside the token files on purpose: next/font's variable and properties registered in globals.css.
for (const m of readFileSync(join(ROOT, "src/app/globals.css"), "utf8").matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1]);
defined.add("--font-figtree");
// Custom properties a component sets on itself from JSX (style={{ "--i": n }}) are local, not tokens.
for (const f of walk(join(ROOT, "src")).filter((f) => /\.tsx?$/.test(f))) {
  for (const m of readFileSync(f, "utf8").matchAll(/["'`](--[\w-]+)["'`]?\s*[:\],]/g)) defined.add(m[1]);
}

let errors = 0, warnings = 0;
const files = targets.flatMap((t) => walk(join(ROOT, t))).filter((f) => /\.(css|tsx?)$/.test(f) && !f.startsWith(TOKENS));
for (const f of files) {
  const src = readFileSync(f, "utf8");
  const local = new Set([...src.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  const lines = src.split("\n");
  lines.forEach((line, i) => {
    const at = `${relative(ROOT, f)}:${i + 1}`;
    for (const m of line.matchAll(/var\((--[\w-]+)(?![\w-]|\s*,)/g)) {  // var(--x, fallback) is allowed to be unset
      // `--space-${n}` style template names are checked where they're built, not here
      if (!defined.has(m[1]) && !local.has(m[1]) && !line.includes("${")) { console.log(`✗ ${at}  ${m[1]} is not a token`); errors++; }
    }
    if (!f.endsWith(".css")) return;
    const code = line.replace(/\/\*.*?\*\//g, "");
    if (/#[0-9a-f]{3,8}\b|\b(rgba?|hsla?)\(/i.test(code)) { console.log(`! ${at}  raw color: use a color token`); warnings++; }
    if (/font-size:\s*\d/.test(code)) { console.log(`! ${at}  raw font-size: use --fs-* or <Text variant>`); warnings++; }
  });
}
console.log(`\n${files.length} files · ${errors} undefined tokens · ${warnings} warnings`);
process.exit(errors ? 1 : 0);
