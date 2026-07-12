/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  outputFileTracingRoot: import.meta.dirname,
  // Verification builds set NEXT_DIST_DIR so they never clobber the
  // dev server's .next cache (which causes "Cannot find module" 500s).
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
