import fs from "fs";
import path from "path";
import { type PostcardData } from "./postcards-client";

export * from "./postcards-client";

/**
 * Server-only postcard storage. With SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY set it uses the Supabase `postcards` table
 * (via PostgREST; the service key stays server-side and RLS blocks all
 * public access). Without them it falls back to a local JSON file so
 * dev works with zero setup.
 */

export type StoredPostcard = PostcardData & {
  approved: boolean;
  createdAt: string;
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function supabaseHeaders() {
  return {
    apikey: SUPABASE_KEY!,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function appendPostcard(card: StoredPostcard) {
  if (SUPABASE_URL && SUPABASE_KEY) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/postcards`, {
      method: "POST",
      headers: supabaseHeaders(),
      body: JSON.stringify({
        id: card.id,
        bg: card.design.bg,
        fg: card.design.fg,
        deco: card.design.deco,
        text: card.text,
        name: card.name,
        approved: card.approved,
        created_at: card.createdAt,
      }),
    });
    if (!res.ok) throw new Error(`supabase insert failed: ${res.status}`);
    return;
  }
  appendLocal(card);
}

export async function listApprovedPostcards(
  limit = 11
): Promise<PostcardData[]> {
  if (SUPABASE_URL && SUPABASE_KEY) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/postcards?approved=is.true&order=created_at.desc&limit=${limit}&select=id,bg,fg,deco,text,name`,
      { headers: supabaseHeaders(), cache: "no-store" }
    );
    if (!res.ok) return [];
    const rows: {
      id: string;
      bg: PostcardData["design"]["bg"];
      fg: PostcardData["design"]["fg"];
      deco: PostcardData["design"]["deco"];
      text: string;
      name: string;
    }[] = await res.json();
    return rows.reverse().map((r) => ({
      id: r.id,
      design: { bg: r.bg, fg: r.fg, deco: r.deco },
      text: r.text,
      name: r.name,
    }));
  }
  return listLocal(limit);
}

/* ---- local JSON fallback (dev only) ---- */

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "postcards.json");

function readAll(): StoredPostcard[] {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function appendLocal(card: StoredPostcard) {
  const all = readAll();
  all.push(card);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2));
}

function listLocal(limit: number): PostcardData[] {
  return readAll()
    .filter((c) => c.approved)
    .slice(-limit)
    .map(({ id, design, text, name }) => ({ id, design, text, name }));
}
