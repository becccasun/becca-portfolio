"use client";

/**
 * Ensures case-study block CSS modules are included in the route bundle.
 * MDXRemote can render block components without pulling their stylesheet in dev.
 */
import "./blocks.module.css";

export default function CaseBlockStyles() {
  return null;
}
