import type { Metadata } from "next";
import Header from "@/components/Header";
import PlayBoard from "@/components/PlayBoard";
import { fetchNotes, notesReady } from "@/lib/notes";

export const metadata: Metadata = { title: "Play · Rebecca Sun" };

export default async function PlayPage() {
  // The message board's notes ship with the page, so they show with everything else instead of after a fetch
  const notes = notesReady ? await fetchNotes(60).catch(() => null) : null;
  return (
    <>
      <Header />
      <main>
        <h1 className="sr-only">Play</h1>
        <PlayBoard notes={notes} />
      </main>
    </>
  );
}
