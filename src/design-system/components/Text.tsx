import type { ElementType, HTMLAttributes } from "react";
import { cx } from "./cx";
import s from "./Text.module.css";

// Variant names follow the Figma text styles ("Heading/1" is heading-1, "Body/Large" is body-large).
export type TextVariant =
  | "display" | "heading-1" | "heading-2" | "heading-3" | "quote" | "lead"
  | "body-large" | "body" | "ui" | "ui-medium" | "small" | "small-light"
  | "caption" | "micro" | "micro-strong" | "eyebrow" | "tag";
export type TextTone = "ink" | "ink-strong" | "dim" | "soft" | "tag" | "muted" | "hint" | "on-dark" | "on-dark-muted" | "danger-ink" | "inherit";

const DEFAULT_TAG: Partial<Record<TextVariant, ElementType>> = {
  display: "h1", "heading-1": "h1", "heading-2": "h2", "heading-3": "h3", quote: "blockquote",
};

/** Any run of text. Pick the variant for size, the tone for color, and `as` for the element.
 *  <Text variant="heading-2" tone="soft" as="p"> */
export function Text({ as, variant = "body", tone, className, ...rest }:
  { as?: ElementType; variant?: TextVariant; tone?: TextTone } & HTMLAttributes<HTMLElement>) {
  const Tag = as ?? DEFAULT_TAG[variant] ?? "p";
  return <Tag className={cx(s[variant], tone && s[`tone-${tone}`], className)} {...rest} />;
}
