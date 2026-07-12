import fs from "fs";
import path from "path";
import { type BottleMessage } from "./bottle-client";

export * from "./bottle-client";

/**
 * Server-only half of the bottle domain: Rebecca's fallback note and
 * file-backed storage. Storage is a local JSON file (data/bottle.json,
 * gitignored) — swap these internals for a real store before deploying
 * to a serverless host, where local disk does not persist.
 */

/** Rebecca's preset note, shown when the sea is empty or the last
 *  message did not pass moderation. */
export const DEFAULT_MESSAGE: BottleMessage = {
  id: "default",
  text: "However you found your way here, I hope something good finds you today. Thanks for washing ashore on my corner of the internet.",
  name: "Rebecca",
  color: "cream",
  icon: "flower",
  approved: true,
  createdAt: "2026-07-12T00:00:00.000Z",
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "bottle.json");

function readAll(): BottleMessage[] {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

export function appendMessage(msg: BottleMessage) {
  const all = readAll();
  all.push(msg);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2));
}

export function latestMessage(): BottleMessage {
  const all = readAll();
  const last = all[all.length - 1];
  if (!last) return DEFAULT_MESSAGE;
  return last.approved ? last : DEFAULT_MESSAGE;
}

export function listApproved(limit = 60): BottleMessage[] {
  return readAll()
    .filter((m) => m.approved)
    .slice(-limit)
    .reverse();
}
