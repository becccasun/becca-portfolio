# Rebecca Sun · Design System

The guide for building anything new on rebeccasun.me. Read it before you design a screen, and keep it in step with the code: when a token, component or decor piece changes, this file changes with it.

- **Code:** `src/design-system/` (tokens, components, layout, decor). Live reference at `/system` (unlisted).
- **Figma:** file `1rTK6v2nTl8bq7fWHNJEyc` ("Portfolio"), pages `↳ Foundations`, `↳ Components`, `↳ Decor`, `↳ Guidelines`.
- **Building a screen:** the project skill `.claude/skills/new-screen` walks the steps.

---

## 1. Visual theme and atmosphere

The site is a quiet white gallery with handmade things left on the table. Almost everything structural is restrained: a pure white page, near-black ink (`--ink`, rgb 36 35 35), a single grey family, hairlines drawn as 1px inset shadows instead of borders, and Figtree at regular weight with tightened tracking on headings. Nothing shouts. Hierarchy comes from size and grey steps, not weight or color.

Against that calm surface sits the **decor layer**: perforated postage stamps carrying her own paintings, accordion-folded zines cut from her printed notebooks, fortune-cookie slips on a message board, yellow sticky notes over case-study screenshots, a cream letter card, and a grey ball whose eyes follow your cursor. These pieces are tactile (paper grain, fold creases, a slight lean off true) and they move on soft springs. The contrast is the identity: an editorial, almost clinical frame that makes the handmade objects feel precious.

**Key characteristics**

- Pure white canvas (`--bg`), panels at `--panel` (gray-50), never a tinted background for structure
- One neutral family from gray-50 to gray-950, plus black and white alphas for lines and washes
- Hairlines as `box-shadow: inset 0 0 0 1px var(--line)`, not `border`, so they never shift layout
- Figtree regular for nearly everything; 500 for UI emphasis, 600 only for tiny numerals
- Negative tracking that grows with size (-1.2px at 40 and 60, 0 at 15 and below)
- Dark grey pill buttons (`--button`, gray-700) with a soft three-layer lift
- Color is meaning, not decoration: red for friction, green for what works, YC orange as a brand mark
- Handmade decor: paper, perforation, grain, a lean of 1 to 4 degrees, springy motion

## 2. Color palette and roles

All values live in `tokens/primitives.css` (raw) and `tokens/color.css` (roles). Components read roles only. In Figma: collection `Primitives` (hidden) aliased by collection `Color`.

### Surfaces
| Token | Value | Role | Figma |
|---|---|---|---|
| `--bg` | white | The page | surface/bg |
| `--panel` | gray-50 | Wells, cards, cover placeholders | surface/panel |
| `--frost` | gray-100 | Chat bubbles (at 90%, blurred) | surface/frost |
| `--placeholder` | gray-200 | An image that has not loaded | surface/placeholder |
| `--cream` | cream-100 | The letter card, paper stamps | surface/cream |
| `--sticky` | yellow-200 | Sticky notes | surface/sticky |
| `--footer` | gray-900 | Footer band | surface/footer |

### Text, strongest to faintest
| Token | Value | Role |
|---|---|---|
| `--ink-strong` | gray-950 | Her name, the phone menu |
| `--ink` | gray-850 | Body copy, headings |
| `--nav` | gray-800 | Header links |
| `--dim` | black 75% | Work titles, footer |
| `--soft` | gray-600 | Subheads, secondary paragraphs |
| `--tag` | black 60% | Kickers, tags, signatures |
| `--muted` | gray-500 | Labels, captions, inactive tabs, eyebrows |
| `--hint` | black 45% | Placeholders, dates, meta |
| `--disabled` | black 25% | Disabled text |
| `--on-dark` / `--on-dark-muted` | white / white 70% | Text on `--button` and `--footer` |

### Lines and actions
| Token | Value | Role |
|---|---|---|
| `--line` | black 6% | Hairlines, dividers, well rims |
| `--line-strong` | black 8% | Inputs, chips, image rims |
| `--line-focus` | black 18% | A field being typed into |
| `--line-selected` | `--ink` | The chosen option (1.5px) |
| `--button` / `--button-hover` | gray-700 / gray-900 | Primary actions |
| `--hover-wash` | black 6% | Current nav pill |
| `--focus` | blue-500 | Keyboard focus ring (2px, 2px offset) |

### Meaning
| Token | Role |
|---|---|
| `--danger` (red-500) | Friction marks on screenshots, invalid fields |
| `--danger-ink` (red-600) | Error text |
| `--good` (green-600) | "This works" marks |
| `--success` (green-500) | Positive deltas |
| `--brand-yc` (orange-500) | The Y Combinator mark only |

## 3. Typography

**Figtree** for everything (`--font-sans`, loaded by `next/font`), `--font-ui` for chat and chips. One family, three weights in practice: 400 everywhere, 500 for UI emphasis and tags, 600 for mark numerals. 300 appears once, for work card blurbs.

Use `<Text variant>`; each variant is a Figma text style of the same name.

| Variant | Figma style | Size / line | Tracking | Use |
|---|---|---|---|---|
| `display` | Display | 60 / 72 | -1.2px | One per page, hero only |
| `heading-1` | Heading/1 | 40 / 48 | -1.2px | Page title, case-study title |
| `heading-2` | Heading/2 | 30 / 39 | -0.6px | Intro statements |
| `heading-3` | Heading/3 | 28 / 34 | -0.56px | Section heads, work titles |
| `quote` | Quote | 24 / 31 | -0.48px | Pull quotes from research |
| `lead` | Lead | 20 / 28 | -0.4px | Lead paragraphs, letter body |
| `body-large` | Body/Large | 17 / 27 | -0.17px | Case-study prose |
| `body` | Body/Default | 16 / 23.2 | -0.32px | Everyday copy, nav, buttons |
| `ui` / `ui-medium` | UI/Default, UI/Medium | 15 / 22 | 0 | Tables, option names, legends |
| `small` / `small-light` | Small/Default, Small/Light | 14 / 20 | 0 | Captions, kickers, blurbs |
| `caption` | Caption | 13 / 18 | 0 | Chips, footer links, slips |
| `micro` / `micro-strong` | Micro/Default, Micro/Strong | 12 / 16 | 0 | Overlay tags, step numbers |
| `eyebrow` | Eyebrow | 12 / 16 | 0.08em, caps | Labels above facts and groups |
| `tag` | Tag | 11 / 14 | 0, 500 | Solid tags |

**Principles**

- Tracking tightens as size grows; 15px and below sit at 0.
- Hierarchy through size and grey step, not bold. A heading is regular weight.
- Eyebrows are the only caps text, always `--muted`, always 0.08em.
- Tone sets the grey: `<Text variant="body" tone="soft">`. Tones: ink, ink-strong, dim, soft, tag, muted, hint, on-dark, on-dark-muted, danger-ink, inherit.

## 4. Components

Import from `@/design-system`. Each one reads semantic tokens only and has a Figma component set with matching variant names on the `↳ Components` page.

| Component | Props | Figma variants | Notes |
|---|---|---|---|
| `Button` | `shape` pill / rect, `size` sm / md / lg, `href` | Shape × Size × State | pill lg is the hero CTA with lift; rect md is the case-study link-out |
| `IconButton` | `onDark` | Surface × State | Needs `aria-label` |
| `NavLink` | `current` | State | Current sits in the grey pill; hover drops to 55% |
| `Chip` | | State | Tappable suggestion; lifts 1px on hover |
| `Tag` | `variant` solid / overlay | Variant | Solid on cards, overlay on images |
| `Eyebrow` | | | Same as `<Text variant="eyebrow">` |
| `StepNumber` | `n`, `active` | State | Steppers and slideshow tabs |
| `Mark` | `n`, `tone` friction / good, `pinned` | Tone × Pinned | Numbered pin on a screenshot |
| `OptionCard` | `name`, `note`, `chosen` | State | Chosen gets the 1.5px ink ring and a Chosen tag |
| `Stat` | `value`, `label` | | Put a row inside `<dl>` |
| `Well` | | | Framed media slot, 12px corners, hairline rim |
| `WorkCard` | `image`, `kicker`, `title`, `blurb`, `href` | | 563:363 thumbnail |
| `Slip` | `body`, `name`, `tilt` | Author | Message board note |
| `ChatQuestion` / `ChatReply` | children | | Dark chip / frosted bubble with tail |
| `TextField` | `invalid` + input props | State | Ring on focus, red ring when invalid |
| `Text` | `variant`, `tone`, `as` | (text styles) | Any run of text |

**Layout** (also from `@/design-system`):

| Component | Props | Notes |
|---|---|---|
| `Page` | `width` col / wide / page | Centres at 960 / 1040 / 1146, clears the fixed header, 16px gutter |
| `Section` | `divider` | 48px top and bottom, 24px between children, optional hairline |
| `Stack` | `gap` (spacing step), `row`, `align`, `wrap` | `gap={24}` is `var(--space-24)` |
| `Grid` | `cols` 1 to 4 or `min` px, `gap` | Collapses to one column under 720px |

## 5. Decor: the handmade layer

Import from `@/design-system/decor`. Values in `tokens/decor.css`; Figma page `↳ Decor`; every piece listed in `decor/catalog.ts` (shown on `/system`).

**Shipped**

| Piece | Code | What it is |
|---|---|---|
| Stamp | `Stamp`, `StampRow`, `PERFORATION_MASK` | Perforated SVG postage stamp: grained paper, inset art (her paintings or blurred color fields under film grain), faint fold creases |
| Tilt card | `TiltCard` | Dents and tilts toward the pointer on a spring; clips to a mask so stamps keep their edge |
| Zine field | `ZineField` | Accordion strips cut from her notebooks; unfold on load, lie flat on hover |
| Eye tracker | `EyeTracker` | Grey ball whose eyes sit on its surface and follow the cursor |
| Pointer smudge | `HeroCanvas` | Soft grey trail behind the pointer |
| Slip | `Slip` (components) | Fortune-cookie note, leans up to `--tilt-slip` |
| Sticky note | `<Paper kind="sticky">` | Yellow, olive ink, leans `--tilt-sticky`, `--shadow-sticky` |
| Letter card | `<Paper kind="letter">` | Large cream card, 20px corners |
| Placeholder stamp | `<Paper kind="placeholder" tilt={4}>` | Striped khaki with a dashed cream edge |
| Grain | `<Grain>` | Fractal-noise texture over any paper or art |

**Adding a new piece** (a ticket stub, a receipt, a pressed flower, a polaroid...):

1. Start from `<Paper kind>` and `<Grain>`; add a new `kind` if no paper fits.
2. Put new values in `tokens/decor.css` (papers, tilts, shadows) and raw colors in `primitives.css`.
3. Build it in `src/design-system/decor/`, export it from `decor/index.ts`, add a `catalog.ts` entry (status `planned` while it is in progress).
4. Draw it on the Figma `↳ Decor` page as a component, bound to the Decor variables.

**Decor rules**

- Paper leans 1 to 4 degrees, never more. Wiggle (-8deg) is a hover gesture only.
- Lean is deterministic: hash an id to an angle, so things never reshuffle on reload.
- Grain sits at `--grain-alpha`, multiplied on light paper and screened on dark.
- Decor is texture, not chrome. It never carries navigation or the only copy of information.
- At most one moving decor piece per viewport. Respect `prefers-reduced-motion`: pieces settle still.

## 6. Layout

- **Widths:** `--col` 960 (reading), `--wide` 1040, `--page` 1146 (works grid, case studies). `--gutter` 16px on small screens.
- **Header:** fixed, `--header-h` 64px, with a soft blur band behind it. `Page` pads for it.
- **Spacing scale:** 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 64, 72, 96, 120 (`--space-N` is N px). Inside components stay at 16 and below; between sections use 48 to 120.
- **Grids:** works are two columns with a 20px gutter; impact stats three; everything stacks under 720px.
- **Whitespace:** generous between sections (72 to 160px on the home page), compact inside cards.

**Radius**

| Token | Use |
|---|---|
| `--radius-2` | Paper: slips, sticky notes |
| `--radius-4` / `-6` | Tags inside cards, small labels |
| `--radius-8` | Tabs, thumbnails, fields, icon buttons |
| `--radius-10` | The link-out button |
| `--radius-12` | Wells, option cards, composer |
| `--radius-16` / `-20` | Portraits, large panels, the letter card |
| `--radius-28` | The works sheet, the chat bar |
| `--radius-full` | Pills, nav links, chips |

## 7. Depth and elevation

Shadows are soft and low. Edges come from rims, not borders.

| Token | Use |
|---|---|
| `--shadow-rim` / `--shadow-rim-inset` | Hairline edge on wells, fields, steps |
| `--shadow-selected` | 1.5px ink ring for the chosen or focused thing |
| `--shadow-button` | Hero pill: inner highlight, tight drop, soft spread |
| `--shadow-chip` | Chips |
| `--shadow-card` | Chat reply, floating cards |
| `--shadow-pop` | Popovers |
| `--shadow-cursor` | The custom cursor |
| `--shadow-browser` | Browser-frame mockups |
| `--shadow-slip` | Paper on the board |
| `--shadow-sticky` | Sticky notes |
| `--shadow-sheet` | Bottom sheets |

Figma: an effect style per token (`shadow/rim`, `shadow/button`...).

## 8. Motion

- `--spring` (Framer's 400 / 40 spring as `linear()`) for anything that lifts or scales: buttons, chips, cards.
- `--ease-out` for entrances, `--ease-in` for exits. `--dur-fast` 0.2s for color and opacity, `--dur-base` 0.45s, `--dur-slow` 0.9s.
- Hover is small: scale 1.03 on the hero pill, 1px lift on chips, opacity 0.55 on nav. Decor gets the bigger gestures.
- Every animation has a `prefers-reduced-motion: reduce` path.

## 9. Do and don't

**Do**
- Start every screen from `Page`, `Section`, `Stack`, `Grid` and `Text`
- Read semantic tokens (`--ink`, `--line`, `--space-24`), never primitives or raw values
- Use rims (inset shadows) for edges and the grey steps for hierarchy
- Keep headings regular weight with negative tracking
- Let one piece of decor carry the personality of a screen
- Write copy with colons, commas, periods or " · ", never em dashes

**Don't**
- Don't tint the page or use color for structure; color means something
- Don't bold headings or add a second typeface
- Don't use `border` for hairlines, or hard drop shadows
- Don't tilt UI (buttons, cards, inputs); only paper leans
- Don't invent a size off the spacing or type scale; add a token first if one is truly missing
- Don't use `--brand-yc` for anything but the YC mark

## 10. Responsive

| Name | Width | Changes |
|---|---|---|
| Mobile | under 720px | One column, `Page` top padding shrinks, header becomes the phone menu |
| Tablet | 720 to 900px | Some two-column layouts (letter card, case studies) stack at 900 |
| Desktop | 900px and up | Full layout |

720px is the breakpoint to reach for (`--break-md` documents it; media queries need the number). Touch targets stay at 32px or more. Hover-only effects sit behind `@media (hover: hover)`.

## 11. Agent prompt guide

**Quick reference**
- Page `--bg` white, text `--ink`, secondary `--soft`, labels `--muted`
- Edge `--shadow-rim-inset`, divider `--line`, chosen `--shadow-selected`
- Primary action `<Button>` (dark grey pill), link-out `<Button shape="rect" size="md">`
- Friction `--danger`, works `--good`

**Example prompts**
- "Build a page at `/now` with `<Page width="col">`: an eyebrow 'Now', a `heading-1`, a `lead` paragraph in `tone="soft"`, then a `Section divider` with a two-column `Grid` of `Stat`s."
- "Add a case-study block: a `Well` with a screenshot and three `Mark pinned` pins, then a `Stack gap={12}` of `OptionCard`s with the second one `chosen`."
- "Make a guestbook strip: slips from `Slip` leaning by a hashed id within 1.2deg, on a `--panel` band, with a `TextField` and `<Button size="sm">Send</Button>`."
- "New decor: a ticket stub. Start from `<Paper kind>`, add `--paper-ticket` in decor.css, perforate one edge with the stamp's bite pattern, lean 2deg, add it to catalog.ts and the Figma Decor page."

**Iteration guide**
1. Layout first (`Page`, `Section`, `Grid`, `Stack`), then text, then components, then at most one decor piece.
2. Run `node scripts/ds-check.mjs <your files>`; fix every ✗ and question every !.
3. Check it at 1440 and 390 wide, and with reduced motion.
4. If you needed a new value, it becomes a token in code and a variable in Figma in the same change.
