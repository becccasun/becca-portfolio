import fs from "fs";
import path from "path";

/**
 * Server-only visitor tally, storing the same two ways postcards do:
 * the Supabase `visitors` table when SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY are set, and a local JSON file when they
 * are not, so dev works with no setup.
 *
 * The number handed to a visitor is a row id, not a running total that
 * this code works out. Postgres assigns it inside the insert, so two
 * people arriving in the same instant get two different numbers with no
 * lock and no read-then-write in between. The local file has no such
 * guarantee, which is fine for one machine in dev and is one more
 * reason production wants the table.
 *
 * The table this expects, if it does not exist yet:
 *
 *   create table public.visitors (
 *     id bigint generated always as identity primary key,
 *     created_at timestamptz not null default now()
 *   );
 *   alter table public.visitors enable row level security;
 *
 * No policies: the service key bypasses RLS and nothing else can read
 * or write it, which is how the postcards table is set up too.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "visitors.json");

/** Records one arrival and returns which number they are. */
export async function recordVisit(): Promise<number> {
  if (SUPABASE_URL && SUPABASE_KEY) return recordVisitSupabase();
  return recordVisitLocal();
}

async function recordVisitSupabase(): Promise<number> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/visitors`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      // Ask for the inserted row back: its id is the number, assigned
      // by the database rather than counted by us.
      Prefer: "return=representation",
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    throw new Error(`supabase visitor insert failed: ${res.status}`);
  }
  const rows = (await res.json()) as { id: number }[];
  const id = rows?.[0]?.id;
  if (typeof id !== "number") {
    throw new Error("supabase visitor insert returned no id");
  }
  return id;
}

function recordVisitLocal(): number {
  let count = 0;
  try {
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as {
      count?: number;
    };
    count = typeof raw.count === "number" ? raw.count : 0;
  } catch {
    // No file yet, or it was left unreadable: start the tally over
    // rather than failing the request.
  }
  const next = count + 1;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ count: next }, null, 2));
  return next;
}
