import type { Metadata } from "next";
import PlayView from "@/components/play/PlayView";

export const metadata: Metadata = {
  title: "Play",
  description: "Experiments, sketches, and things made for fun.",
};

export default function PlayPage() {
  return <PlayView />;
}
