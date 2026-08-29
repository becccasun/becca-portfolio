/**
 * Fortunes for the footer bottle. Kept local rather than generated:
 * the bottle has to answer the moment it is clicked, and a fortune that
 * waits on a network round trip stops feeling like a fortune.
 *
 * They are about making things, not about luck. A generic cookie line
 * would read as filler on a portfolio; these are the notes Rebecca
 * would actually put in a bottle.
 */
export const FORTUNES: string[] = [
  "The detail you keep noticing is the one worth fixing.",
  "A constraint you chose yourself is not a constraint.",
  "The second draft is where the idea actually starts.",
  "Someone will use this at 2am. Design for them.",
  "You will explain it three times before it gets simple.",
  "The plain version is the one that ships. Make the plain version good.",
  "Trust the sketch you made before you knew the rules.",
  "What you delete is also a decision.",
  "The most useful feedback always arrives inconveniently.",
  "Your taste is ahead of your hands. That is the right order.",
  "Ship it while you still like it.",
  "The problem is rarely where the bug is.",
  "Name it honestly and the design follows.",
  "You are allowed to make it beautiful.",
  "Every system began as somebody's shortcut.",
  "Rest is part of the process, not a pause in it.",
];

/**
 * Draws a fortune that isn't the one already showing, so a second click
 * always visibly does something. Falls back to a plain pick when only
 * one fortune exists.
 */
export function drawFortune(previous?: string): string {
  const pool = previous
    ? FORTUNES.filter((f) => f !== previous)
    : FORTUNES;
  const from = pool.length > 0 ? pool : FORTUNES;
  return from[Math.floor(Math.random() * from.length)];
}
