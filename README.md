# rebeccasun.me

Portfolio built to the Phase 1 design spec. Next.js App Router, MDX case
studies, Claude-powered chat behind a server route. Deploys to Vercel.

## Run it

```bash
npm install
cp .env.example .env.local   # add your Anthropic key for the chat panel
npm run dev
```

The site works without the key; the chat panel returns a friendly 503 until
`ANTHROPIC_API_KEY` is set.

## Where things live

| Path | What |
|---|---|
| `src/app/globals.css` | All design tokens (color, type scale, spacing, radius) |
| `src/lib/site.ts` | Wordmark, tagline, email, experience timeline |
| `content/work/*.mdx` | Case studies. Frontmatter drives tiering, ordering, and the TOC |
| `src/components/case/blocks.tsx` | `Section` `Prose` `Figure` `Video` `Gallery` `PullQuote` `Spacer` |
| `src/app/api/chat/route.ts` | Claude endpoint, grounded by `src/lib/chat-context.ts` |
| `public/hero/`, `public/work/` | Placeholder SVGs. Replace with real photos and covers |

## Adding a case study

Create `content/work/<slug>.mdx`. Frontmatter fields:

- `tier: 1` puts it in the home grid; `tier: 2` puts it in the lighter list.
  Everything appears at `/work`.
- `order` sorts within the grid and archive.
- `sections` is the source of truth for the sticky TOC; each `id` must match
  a `<Section id=...>` in the body.

The chat endpoint reads the same MDX files, so new case studies become
askable automatically.

## Still open (Phase 1 spec, section 5)

- Real content for UMi, DPSS, AgentMail (placeholder files exist).
- Hero photos and per-project imagery (SVG placeholders in `public/`).
- Footer interaction concept. The structure ships with a reserved slot
  (`data-footer-interaction-slot` in `Footer.tsx`); the playful concept is
  still to be brainstormed and must be original, not Emmi's garden.
