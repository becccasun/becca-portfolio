import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A separate output folder lets a production build run without clobbering the dev server's .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Writing covers and article images come from Medium's CDNs; next/image serves them from this origin
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn-images-1.medium.com" },
      { protocol: "https", hostname: "miro.medium.com" },
    ],
  },
};

export default nextConfig;
