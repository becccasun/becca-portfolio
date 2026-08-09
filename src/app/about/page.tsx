import type { Metadata } from "next";
import AboutCarousel from "@/components/about/AboutCarousel";

export const metadata: Metadata = {
  title: "About",
  description: "Who Rebecca is and how she works.",
};

export default function AboutPage() {
  return <AboutCarousel />;
}
