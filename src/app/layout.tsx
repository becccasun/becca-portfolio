import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "@/design-system/tokens/index.css";
import "./globals.css";
import Footer from "@/components/Footer";
import Chat from "@/components/Chat";
import SiteAnalytics from "@/components/SiteAnalytics";

// Figtree stands in for the original's Roobert (a commercial Displaay face).
// If you hold a Roobert licence, drop the files in /public/fonts and point --font-sans at it.
const sans = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

// Search results and link previews (Slack, Discord, iMessage, LinkedIn, X): the share
// card is opengraph-image.jpg / twitter-image.jpg in this folder; metadataBase makes
// their URLs absolute. PERSON below is the structured data search engines read.
export const metadata: Metadata = {
  metadataBase: new URL("https://www.rebeccasun.me"),
  title: "Rebecca Sun, UX Design at University of Michigan",
  description: "Rebecca Sun is a full-stack designer building artful experiences.",
  openGraph: {
    type: "website",
    siteName: "Rebecca Sun",
    // no og:title here, so each page's own <title> (About · Rebecca Sun, …) names its preview
    description: "Rebecca Sun is a full-stack designer building artful experiences.",
  },
  twitter: { card: "summary_large_image" },
};

const PERSON = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Rebecca Sun",
  jobTitle: "UX Design at University of Michigan",
  description: "Rebecca Sun is a full-stack designer building artful experiences.",
  url: "https://www.rebeccasun.me",
  image: "https://www.rebeccasun.me/opengraph-image.jpg",
  alumniOf: { "@type": "CollegeOrUniversity", name: "University of Michigan" },
  sameAs: ["https://www.linkedin.com/in/beccasun/", "https://github.com/becccasun", "https://x.com/beqscreatives"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script below adds the "js" class before React loads
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      {/* Browser extensions (Grammarly, etc.) stamp attributes onto <body> before React
          loads; this ignores attribute differences on this one element only. */}
      <body suppressHydrationWarning>
        {/* Runs before any image is parsed. Marks the page as scripted (so styles may hide an image until it
            arrives, knowing something will show it) and stamps each image inside a [data-img-fade] area data-loaded
            the moment it lands or fails, even before React has loaded (those images set suppressHydrationWarning). Load events don't bubble (and never reach window), so this listens on document in the capture phase. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js");function m(e){var t=e.target;if(t&&t.tagName==="IMG"&&t.closest("[data-img-fade]"))t.setAttribute("data-loaded","")}document.addEventListener("load",m,true);document.addEventListener("error",m,true);`,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON) }} />
        {/* Pages link with plain <a>, so each click is a full load. Hovering a link (or
            pressing it) fetches its HTML ahead of time, so the page transition can start
            without waiting on the network. Prefetch only: unlike prerender it runs no
            scripts, so analytics never count a page nobody opened. */}
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              prefetch: [{ where: { and: [{ href_matches: "/*" }, { not: { href_matches: "/api/*" } }] }, eagerness: "moderate" }],
            }),
          }}
        />
        {children}
        {/* On every page: the sign-off footer, and the chat with its mascot, which lands in the footer's corner */}
        <Footer />
        <Chat />
        <SiteAnalytics />
      </body>
    </html>
  );
}
