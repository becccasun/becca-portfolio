import type { Metadata } from "next";
import Header from "@/components/Header";
import PlayBoard from "@/components/PlayBoard";

export const metadata: Metadata = { title: "Play · Rebecca Sun" };

export default function PlayPage() {
  return (
    <>
      <Header />
      <main>
        <h1 className="sr-only">Play</h1>
        <PlayBoard />
      </main>
    </>
  );
}
