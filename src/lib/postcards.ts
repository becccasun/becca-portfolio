import fs from "fs";
import path from "path";
import { normalizeDesign, type PostcardData } from "./postcards-client";

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
        // The table predates the art/stamp catalogs: `bg` holds the
        // picture and `fg` the stamp. Renaming the columns is a pending
        // migration, not a behaviour change.
        bg: card.design.art,
        fg: card.design.stamp,
        // `deco` is the only spare column, so it carries the two new
        // sender fields until the table gains real ones.
        deco: JSON.stringify({ city: card.city ?? "", role: card.role ?? "" }),
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
      bg: string;
      fg: string;
      deco: string | null;
      text: string;
      name: string;
    }[] = await res.json();
    return rows.reverse().map((r) => {
      // Rows written before the sender fields existed hold a plain
      // decoration id here rather than JSON.
      let city = "";
      let role = "";
      try {
        const extra = JSON.parse(r.deco ?? "{}");
        city = String(extra.city ?? "");
        role = String(extra.role ?? "");
      } catch {
        /* legacy row */
      }
      return {
        id: r.id,
        design: normalizeDesign({ art: r.bg, stamp: r.fg }),
        text: r.text,
        name: r.name,
        city,
        role,
      };
    });
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
    .map(({ id, design, text, name, city, role }) => ({
      id,
      design: normalizeDesign(design),
      text,
      name,
      city: city ?? "",
      role: role ?? "",
    }));
}
