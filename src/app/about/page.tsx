import type { Metadata } from "next";
import AboutScroller from "@/components/AboutScroller";

export const metadata: Metadata = {
  title: "About",
  description: "Who Rebecca is and how she works.",
};

export default function AboutPage() {
  return <AboutScroller />;
}
