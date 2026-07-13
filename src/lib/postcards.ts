import fs from "fs";
import path from "path";
import { type PostcardData } from "./postcards-client";

export * from "./postcards-client";

/**
 * Server-only postcard storage: a local JSON file (data/postcards.json,
 * gitignored). Works in dev and on persistent hosts; swap these
 * internals for a real store before deploying to serverless.
 */

export type StoredPostcard = PostcardData & {
  approved: boolean;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "postcards.json");

function readAll(): StoredPostcard[] {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

export function appendPostcard(card: StoredPostcard) {
  const all = readAll();
  all.push(card);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2));
}

export function listApprovedPostcards(limit = 11): PostcardData[] {
  return readAll()
    .filter((c) => c.approved)
    .slice(-limit)
    .map(({ id, design, text, name }) => ({ id, design, text, name }));
}
