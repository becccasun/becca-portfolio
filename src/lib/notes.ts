// Message board on /play: notes live in the `notes` table of the rebecca-portfolio
// Supabase project (schema in supabase/notes.sql). The browser talks to it directly
// with the publishable key, which is public by design: row-level security only lets it
// read approved notes and add new ones for review. That also keeps the board working on
// the GitHub Pages export, which has no API routes.
const API = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dohilwcnbiyfuliaorxn.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_2KyQyDanneo4-ADIwoIsEA_8b--tOQR";

export const NOTE_MAX = 140;
export const NAME_MAX = 40;

export type Note = { id: string; created_at: string; body: string; name: string | null; from_rebecca: boolean };

export const notesReady = Boolean(KEY);

const headers = { apikey: KEY, "Content-Type": "application/json" };

export async function fetchNotes(): Promise<Note[]> {
  const res = await fetch(
    `${API}/rest/v1/notes?select=id,created_at,body,name,from_rebecca&approved=eq.true&order=created_at.desc&limit=200`,
    { headers, cache: "no-store" },
  );
  if (!res.ok) throw new Error(`notes ${res.status}`);
  return res.json();
}

export async function sendNote(body: string, name: string): Promise<void> {
  const res = await fetch(`${API}/rest/v1/notes`, {
    method: "POST",
    // return=minimal: a visitor can't read back an unapproved row, so don't ask for it
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ body: body.trim(), name: name.trim() || null }),
  });
  if (!res.ok) throw new Error(`send ${res.status}`);
}
