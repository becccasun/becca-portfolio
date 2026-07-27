/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  outputFileTracingRoot: import.meta.dirname,
  // Verification builds set NEXT_DIST_DIR so they never clobber the
  // dev server's .next cache (which causes "Cannot find module" 500s).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Blog covers come from Medium. Routing them through next/image serves
  // them from this origin, so content blockers that filter Medium's CDN
  // don't leave the writing index full of empty boxes.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn-images-1.medium.com" },
      { protocol: "https", hostname: "miro.medium.com" },
    ],
  },
};

export default nextConfig;
