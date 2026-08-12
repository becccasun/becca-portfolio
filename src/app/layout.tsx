import type { Metadata } from "next";
import { Instrument_Serif, Figtree } from "next/font/google";
import { SITE } from "@/lib/site";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChatPanel from "@/components/ChatPanel";
import "./globals.css";

const instrument = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} · Design Engineer`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.tagline,
  metadataBase: new URL(SITE.url),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${instrument.variable} ${figtree.variable}`}>
      <body>
        <Cursor />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <ChatPanel />
      </body>
    </html>
  );
}
