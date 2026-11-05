// The decor catalog: every handmade piece the site has, and the slots for the ones
// still to come. /system lists it, and the Figma "Decor" page has a frame per entry.
// To add a piece: build it in this folder (or in src/components if it's site-specific),
// read values from tokens/decor.css, add an entry here, and draw it on the Figma Decor page.
export type DecorEntry = {
  name: string;
  status: "shipped" | "planned";
  what: string;
  where?: string;   // where it appears on the site
  code?: string;    // import path
};

export const decor: DecorEntry[] = [
  { name: "Stamp", status: "shipped", code: "@/design-system/decor (Stamp)", where: "Home hero",
    what: "Perforated postage stamp in SVG: paper with grain, inset art (her paintings or blurred colour fields under film grain), faint fold creases." },
  { name: "Tilt card", status: "shipped", code: "@/design-system/decor (TiltCard)", where: "Open hero stamp",
    what: "Card that dents and tilts toward the pointer on a spring; clips to a mask so the stamp keeps its perforated edge." },
  { name: "Zine field", status: "shipped", code: "@/design-system/decor (ZineField)", where: "Home hero",
    what: "Accordion-folded strips cut from her own publications; unfold on load, lie flat on hover." },
  { name: "Eye tracker", status: "shipped", code: "@/design-system/decor (EyeTracker)", where: "Chat mascot",
    what: "A grey ball whose two eyes sit on its surface and follow the cursor anywhere on the page." },
  { name: "Pointer smudge", status: "shipped", code: "@/design-system/decor (HeroCanvas)", where: "Home hero",
    what: "Soft grey smudge that trails the pointer and fades." },
  { name: "Slip", status: "shipped", code: "@/design-system (Slip)", where: "Play, message board",
    what: "Fortune-cookie slip of paper, leaning up to 1.2deg either way, signed in caps." },
  { name: "Sticky note", status: "shipped", code: '<Paper kind="sticky">', where: "Case-study slides",
    what: "Yellow note with olive ink, leaning 1.5deg, pinned over a screenshot." },
  { name: "Letter card", status: "shipped", code: '<Paper kind="letter">', where: "Home",
    what: "Large cream card, 20px corners, written like a letter." },
  { name: "Placeholder stamp", status: "shipped", code: '<Paper kind="placeholder" tilt={4}>', where: "Corner of the letter card",
    what: "Striped khaki stamp with a dashed cream edge, leaning 4deg." },
  { name: "Grain", status: "shipped", code: "@/design-system/decor (Grain)",
    what: "Fractal-noise texture laid over any paper or art." },
];
