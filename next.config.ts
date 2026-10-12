import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A separate output folder lets a production build run without clobbering the dev server's .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
