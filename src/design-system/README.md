# src/design-system

Everything the site is drawn with, in one place. `DESIGN.md` is the guide (what to use and why); this file is the map.

```
design-system/
  DESIGN.md            the guide: atmosphere, roles, rules, prompts
  index.ts             import { Page, Text, Button, ... } from "@/design-system"
  tokens/              CSS custom properties, one file per Figma collection
    index.css            import order = layer order (loaded once in app/layout.tsx)
    primitives.css       raw values                      Figma: Primitives (hidden)
    color.css            roles: surface, text, line...   Figma: Color
    spacing.css radius.css type.css                      Figma: Spacing, Radius, Type
    elevation.css        shadows                          Figma: effect styles shadow/*
    layout.css motion.css                                 code only
    decor.css            papers, tilts, grain             Figma: Decor
    read.ts              build-time reader used by /system
  components/          one Name.tsx + Name.module.css per component   Figma: ↳ Components
  layout/              Page, Section, Stack, Grid
  decor/               Paper, Grain, catalog.ts + re-exports of Stamp, TiltCard...   Figma: ↳ Decor
```

Rules of the folder:

- Components read semantic tokens only. `node scripts/ds-check.mjs` checks it.
- A new value is a token first (in the right file), then a Figma variable with the same name as its code syntax (`var(--x)`).
- A new component gets a file pair here, an export in `components/index.ts`, a spec on `/system`, and a Figma component with matching prop names.
- A new decor piece gets an entry in `decor/catalog.ts` too.
- The older site components in `src/components` still use their own module styles; move them onto these pieces as they're touched.
