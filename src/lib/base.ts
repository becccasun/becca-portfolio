// The site can be served from a subfolder (GitHub Pages serves it at /becca-portfolio).
// Next prefixes its own assets; every path we write ourselves goes through withBase.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

export const withBase = (path?: string) => (path && path.startsWith("/") ? `${BASE_PATH}${path}` : path ?? "");
