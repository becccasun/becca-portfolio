// Decor: the handmade layer (paper, stamps, tilt, grain). Kept out of the main
// "@/design-system" barrel so screens that don't use it don't load it.
export { Paper, type PaperKind } from "./Paper";
export { Grain } from "./Grain";
export { decor, type DecorEntry } from "./catalog";

// Pieces that predate the design system stay where the site imports them from;
// they are re-exported here so new screens have one place to reach for decor.
export { default as Stamp, PERFORATION_MASK, STAMP_W, STAMP_H } from "@/components/Stamp";
export { default as StampRow } from "@/components/StampRow";
export { TiltCard } from "@/components/TiltCard";
export { EyeTracker } from "@/components/EyeTracker";
export { default as ZineField } from "@/components/ZineField";
export { default as HeroCanvas } from "@/components/HeroCanvas";
