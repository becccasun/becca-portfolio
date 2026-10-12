import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds plain files for GitHub Pages, served from /becca-portfolio.
// Without it, the site runs as a normal Next.js server (dev, or a host like Vercel).
const staticExport = process.env.STATIC_EXPORT === "1";
const basePath = staticExport ? process.env.BASE_PATH ?? "/becca-portfolio" : "";

const nextConfig: NextConfig = {
  // A separate output folder lets a production build run without clobbering the dev server's .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
  ...(staticExport && { output: "export", basePath, trailingSlash: true }),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_STATIC_EXPORT: staticExport ? "1" : "0",
  },
  images: {
    // A static host has no image server, so images are served as they are
    unoptimized: staticExport,
    // Writing covers and article images come from Medium's CDNs; next/image serves them from this origin
    remotePatterns: [
      { protocol: "https", hostname: "cdn-images-1.medium.com" },
      { protocol: "https", hostname: "miro.medium.com" },
    ],
  },
};

export default nextConfig;
