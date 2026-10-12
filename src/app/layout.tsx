import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Chat from "@/components/Chat";

// Figtree stands in for the original's Roobert (a commercial Displaay face).
// If you hold a Roobert licence, drop the files in /public/fonts and point --font-sans at it.
const sans = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

export const metadata: Metadata = {
  title: "Rebecca Sun, product designer",
  description: "Rebecca Sun is a full-stack designer building artful experiences.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      {/* Browser extensions (Grammarly, etc.) stamp attributes onto <body> before React
          loads; this ignores attribute differences on this one element only. */}
      <body suppressHydrationWarning>
        {children}
        {/* On every page: the sign-off footer, and the chat with its mascot, which lands in the footer's corner */}
        <Footer />
        <Chat />
      </body>
    </html>
  );
}
