---
name: new-screen
description: Build a new page, screen or section for Rebecca's portfolio (rebeccasun.me, this repo) from her design system. Use when asked to add a page, mock up a screen, build a section or block, or make a new decor piece here, and when asked to put that screen into the Figma file too.
---

# Build a screen from the design system

The system lives in `src/design-system/`. Read `src/design-system/DESIGN.md` before writing anything: it has the roles, scales, components, decor and rules. The live reference is `/system`.

## 1. Plan in system terms

Before you write code, describe the screen to yourself in the system's vocabulary:

- **Frame:** `Page width="col" | "wide" | "page"`, then `Section`s (with `divider` where a hairline belongs).
- **Structure:** `Stack gap={step}` and `Grid cols | min`. Gaps are spacing steps (2 to 120), never other numbers.
- **Text:** a `Text variant` per run (display, heading-1..3, quote, lead, body-large, body, ui, small, caption, micro, eyebrow, tag) with a `tone`.
- **Components:** from `@/design-system` (Button, IconButton, NavLink, Chip, Tag, Eyebrow, StepNumber, Mark, OptionCard, Stat, Well, WorkCard, Slip, ChatQuestion, ChatReply, TextField).
- **Decor:** at most one piece, from `@/design-system/decor` (Paper, Grain, Stamp, StampRow, TiltCard, ZineField, EyeTracker, HeroCanvas). Check `decor/catalog.ts`.

If something has no component, compose it from layout + Text + tokens in a module CSS file next to the page. If it will repeat, make it a component (step 4).

## 2. Build

- Routes go in `src/app/<route>/page.tsx` with a `<route>.module.css` beside it. Next.js here is v16: check `node_modules/next/dist/docs/` before using an API you are unsure of.
- Import: `import { Page, Section, Stack, Grid, Text, Button } from "@/design-system";`
- Module CSS reads semantic tokens only: `var(--ink)`, `var(--line)`, `var(--space-24)`, `var(--radius-12)`, `var(--shadow-rim-inset)`, `var(--fs-14)`. No hex, rgb or raw font sizes. Edges are inset shadows, not borders.
- Copy: no em dashes (use a colon, comma, period or " · "). Headings regular weight. Only eyebrows are caps.
- Hover effects behind `@media (hover: hover)`, motion with a `prefers-reduced-motion` path, one column under 720px.
- Unfinished or unlisted pages get `robots: { index: false, follow: false }` in their metadata.

## 3. Check

1. `node scripts/ds-check.mjs src/app/<route>` and fix every ✗; justify or fix each !.
2. `npx tsc --noEmit -p .`
3. Build without touching her dev server's `.next`: `NEXT_DIST_DIR=.next-verify npx next build`, then delete `.next-verify` and revert any `tsconfig.json` change the build makes.
4. Look at it: start `next start` (or `next dev`) on a free port, screenshot at 1440 and 390 wide, then stop the server.

## 4. When the system grows

A new value, component or decor piece goes in code and Figma in the same change:

- **Token:** add it to the right file in `src/design-system/tokens/` (raw values in `primitives.css`, a role elsewhere). Add the Figma variable in the matching collection with code syntax `var(--name)` and tight scopes.
- **Component:** `components/Name.tsx` + `Name.module.css`, export it in `components/index.ts`, add a `Spec` on `/system`, list it in DESIGN.md §4, and build a Figma component set on `↳ Components` whose variant properties match the props.
- **Decor:** build in `decor/`, export it in `decor/index.ts`, add a `catalog.ts` entry, add it to DESIGN.md §5, draw it on `↳ Decor`.

## 5. Figma (when asked to put the screen in Figma)

File `1rTK6v2nTl8bq7fWHNJEyc`. Load the `figma:figma-use` and `figma:figma-generate-design` skills first. Build on the `Website Screens` page from instances of the components on `↳ Components` and `↳ Decor`, bind fills, gaps and radii to the `Color`, `Spacing` and `Radius` variables, and apply the text styles (names match the `Text` variants: "Heading/1" is heading-1).

## Ground rules

- Don't push: main deploys the live site. Don't commit unless asked.
- Leave her uncommitted edits alone; check `git status` before touching an existing file.
