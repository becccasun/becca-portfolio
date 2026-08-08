/**
 * Writing, pulled live from Rebecca's Medium RSS feed.
 *
 * Medium publishes a full feed at /feed/@username: title, canonical link,
 * publish date, tags, and the whole post body as HTML. That is everything
 * the index needs, so nothing here scrapes a rendered page.
 *
 * The fetch is revalidated hourly, so a new post appears without a deploy.
 * If Medium is unreachable the page falls back to FALLBACK_POSTS below,
 * which is a snapshot committed to the repo.
 */

import { SITE } from "./site";

export const MEDIUM_URL = SITE.medium;
const FEED_URL = `https://medium.com/feed/@${SITE.mediumHandle}`;
const REVALIDATE_SECONDS = 3600;

export type BlogPost = {
  id: string;
  /** Series marker Rebecca puts in brackets, e.g. "Design Notebook #3". */
  series: string | null;
  title: string;
  href: string;
  /** ISO date, for sorting and <time dateTime>. */
  date: string;
  /** "May 2026", for display. */
  dateLabel: string;
  /** Publication it ran in, when it wasn't her own profile. */
  publication: string | null;
  minutes: number;
  /** Opening line, trimmed. Her words, not a generated summary. */
  excerpt: string;
  image: string | null;
  tags: string[];
};

/** A post plus its body, for the in-app reader at /blogs/[slug]. */
export type BlogArticle = BlogPost & { html: string };

/* ------------------------------------------------------------------ */
/*  Feed parsing                                                       */
/* ------------------------------------------------------------------ */

function decode(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  if (!m) return "";
  return m[1].replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
}

/** Medium's /max/ URLs 301 to /v2/resize:fit/. Skip the hop. */
function normalizeImage(url: string): string {
  return url.replace(
    /^https:\/\/cdn-images-1\.medium\.com\/max\/(\d+)\//,
    "https://cdn-images-1.medium.com/v2/resize:fit:$1/"
  );
}

/**
 * Medium closes every RSS body with a 1x1 tracking pixel on medium.com
 * itself (`/_/stat?event=post.clientViewed`). It is not artwork, and on
 * a post with no real images it would otherwise be picked up as the
 * cover — which throws in next/image, since only the image CDNs below
 * are allowed hosts. Match those hosts and nothing else.
 */
const IMAGE_HOSTS = ["cdn-images-1.medium.com", "miro.medium.com"];

function isContentImage(src: string): boolean {
  try {
    return IMAGE_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

const PUBLICATIONS: Record<string, string> = {
  shiftcreatorspace: "Shift Creator Space",
};

function publicationFrom(link: string): string | null {
  const m = link.match(/^https:\/\/medium\.com\/([^/@][^/]*)\//);
  if (!m) return null;
  return PUBLICATIONS[m[1]] ?? m[1].replace(/-/g, " ");
}

function excerptFrom(html: string): string {
  const paras = [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .map((m) => decode(m[1]))
    .filter((p) => p.length > 40);
  const first = paras[0] ?? "";
  if (first.length <= 180) return first;
  const cut = first.slice(0, 180);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

/* ------------------------------------------------------------------ */
/*  Article body                                                       */
/* ------------------------------------------------------------------ */

/** Tags Medium actually emits, plus the ones a post might grow into. */
const ALLOWED_TAGS = new Set([
  "p", "h1", "h2", "h3", "h4", "strong", "b", "em", "i", "a", "ul", "ol",
  "li", "blockquote", "figure", "figcaption", "img", "pre", "code", "br", "hr",
]);

/** Serve article images from this origin, sized for the reading column. */
function proxied(src: string): string {
  return `/_next/image?url=${encodeURIComponent(normalizeImage(src))}&w=1200&q=75`;
}

function attr(attrs: string, name: string): string | null {
  const m = attrs.match(new RegExp(`${name}="([^"]*)"`, "i"));
  return m ? m[1] : null;
}

/**
 * Rebuild the post body from an allowlist rather than filtering a
 * denylist: unknown tags lose their markup, every attribute is dropped
 * except the handful below, and only http(s) URLs survive. The feed is
 * Rebecca's own writing, but it still arrives over the network and ends
 * up in dangerouslySetInnerHTML.
 */
export function sanitizeBody(html: string): string {
  return html
    .replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(\/?)([a-z0-9]+)([^>]*)>/gi, (_full, close: string, name: string, attrs: string) => {
      const tag = name.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";
      if (close) return `</${tag}>`;

      if (tag === "a") {
        const href = attr(attrs, "href");
        if (!href || !/^https?:\/\//i.test(href)) return "<a>";
        return `<a href="${href}" target="_blank" rel="noreferrer">`;
      }

      if (tag === "img") {
        const src = attr(attrs, "src");
        // Drops the trailing tracking pixel along with anything else
        // that isn't hosted on an image CDN we can actually proxy.
        if (!src || !isContentImage(normalizeImage(src))) return "";
        const alt = attr(attrs, "alt") ?? "";
        return `<img src="${proxied(src)}" alt="${alt}" loading="lazy" />`;
      }

      return `<${tag}>`;
    });
}

function parseItems(xml: string): BlogArticle[] {
  return xml
    .split("<item>")
    .slice(1)
    .map((block): BlogArticle | null => {
      const link = tag(block, "link").split("?")[0];
      const rawTitle = decode(tag(block, "title"));
      if (!link || !rawTitle) return null;

      const body = tag(block, "content:encoded");
      const published = new Date(tag(block, "pubDate"));
      const words = body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
      const cover =
        [...body.matchAll(/<img[^>]+src="([^"]+)"/g)]
          .map((m) => normalizeImage(m[1]))
          .find(isContentImage) ?? null;

      // "[Design Notebook #3] The Noise Around AI Design" splits into a
      // series chip and a title; posts without a marker keep the whole line.
      const marked = rawTitle.match(/^\[(.+?)\]\s*(.+)$/);

      return {
        id: link.split("/").pop() ?? link,
        series: marked ? marked[1] : null,
        title: marked ? marked[2] : rawTitle,
        href: link,
        date: published.toISOString(),
        dateLabel: published.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }),
        publication: publicationFrom(link),
        minutes: Math.max(1, Math.round(words / 220)),
        excerpt: excerptFrom(body),
        image: cover,
        tags: [...block.matchAll(/<category>([\s\S]*?)<\/category>/g)].map((m) =>
          m[1].replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "")
        ),
        html: sanitizeBody(body),
      };
    })
    .filter((p): p is BlogArticle => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Feed metadata without the bodies, for the index. */
export function parseFeed(xml: string): BlogPost[] {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  return parseItems(xml).map(({ html, ...post }) => post);
}

async function fetchFeed(): Promise<BlogArticle[]> {
  const res = await fetch(FEED_URL, {
    headers: { "user-agent": "becca-portfolio" },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`feed responded ${res.status}`);
  const items = parseItems(await res.text());
  if (items.length === 0) throw new Error("feed parsed to zero posts");
  return items;
}

export async function getBlogPosts(): Promise<{
  posts: BlogPost[];
  live: boolean;
}> {
  try {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const posts = (await fetchFeed()).map(({ html, ...post }) => post);
    return { posts, live: true };
  } catch {
    // Medium down, rate limiting, or a feed format change. Show the
    // snapshot rather than an empty page.
    return { posts: FALLBACK_POSTS, live: false };
  }
}

/**
 * One post with its body. Returns null when the id is unknown or the
 * feed is unreachable, which the route turns into a 404 rather than an
 * empty article: the snapshot carries metadata only, so there is no
 * offline body to fall back to.
 */
export async function getBlogArticle(
  id: string
): Promise<{ article: BlogArticle; siblings: BlogPost[] } | null> {
  let items: BlogArticle[];
  try {
    items = await fetchFeed();
  } catch {
    return null;
  }
  const article = items.find((p) => p.id === id);
  if (!article) return null;
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  return { article, siblings: items.map(({ html, ...post }) => post) };
}

/* ------------------------------------------------------------------ */
/*  Snapshot of the feed as of 2026-07-27. Only rendered when the live  */
/*  fetch fails, so it can go stale without breaking anything: the      */
/*  worst case is the page missing the newest post until Medium         */
/*  responds again. Refresh it by running parseFeed() over the feed.    */
/* ------------------------------------------------------------------ */

export const FALLBACK_POSTS: BlogPost[] = [
  {
    id: "atomik-light-jul-2026-rediscovering-work-life-balance-through-designing-postcards-a4c4450bb132",
    series: "Atomik Light Jul. 2026",
    title: "Rediscovering work-life-balance through designing postcards",
    href: "https://medium.com/@becccasun/atomik-light-jul-2026-rediscovering-work-life-balance-through-designing-postcards-a4c4450bb132",
    date: "2026-06-23T04:47:18.000Z",
    dateLabel: "Jun 2026",
    publication: null,
    minutes: 4,
    excerpt:
      "Oil painting is a medium I picked up when I was around 12. For me, experimenting with the vibrant colors and buttery texture of the medium was a great way to create…",
    image:
      "https://cdn-images-1.medium.com/v2/resize:fit:1024/1*-lWQ2FakYWcyCteh7sx9Rw.jpeg",
    tags: ["design", "atomiklight", "illustration", "artist", "lifestyle"],
  },
  {
    id: "umi-create-for-the-love-of-the-game-cbc5c0cdde48",
    series: "Project #1",
    title: "UMI: Create for the love of the game",
    href: "https://medium.com/shiftcreatorspace/umi-create-for-the-love-of-the-game-cbc5c0cdde48",
    date: "2026-06-08T11:57:44.000Z",
    dateLabel: "Jun 2026",
    publication: "Shift Creator Space",
    minutes: 5,
    excerpt:
      "Around a week ago, I flew to Toronto to begin my Summer internship as a Product Designer. Walking out of the YYZ airport felt like I was rushing into a new chapter…",
    image:
      "https://cdn-images-1.medium.com/v2/resize:fit:1024/1*aveHdtHqX4KCC2fMayeXpA.png",
    tags: ["design", "creativity", "product-design"],
  },
  {
    id: "from-designer-vp-design-to-president-at-a-student-run-magazine-efe956d0cb1b",
    series: "Design Notebook #4",
    title: "All because I said yes to one seemingly inconsequential opportunity",
    href: "https://medium.com/@becccasun/from-designer-vp-design-to-president-at-a-student-run-magazine-efe956d0cb1b",
    date: "2026-05-19T01:09:03.000Z",
    dateLabel: "May 2026",
    publication: null,
    minutes: 5,
    excerpt:
      "In sophomore year of high school, I first had the idea of starting my own arts publication because I was frustrated that there was no physical method of keeping my…",
    image:
      "https://cdn-images-1.medium.com/v2/resize:fit:1024/1*Lni6m0p6Z5LMhVs1Y-WO8Q.png",
    tags: ["leadership", "design", "graphic-design", "personal-growth"],
  },
  {
    id: "the-noise-around-ai-design-3aab3f4ee3e9",
    series: "Design Notebook #3",
    title: "The Noise Around AI Design",
    href: "https://medium.com/@becccasun/the-noise-around-ai-design-3aab3f4ee3e9",
    date: "2026-05-04T19:55:49.000Z",
    dateLabel: "May 2026",
    publication: null,
    minutes: 2,
    excerpt:
      "It's been around 5 months since I fully transitioned from architecture to product design, and it has been the most fruitful 5 months of my career.",
    image:
      "https://cdn-images-1.medium.com/v2/resize:fit:1024/1*h3MYZKFw5P-70qF-yCW2Vg.png",
    tags: [],
  },
  {
    id: "rationale-for-dropping-architecture-35ecb9c59d98",
    series: "Design Notebook #2",
    title: "Rationale for dropping architecture",
    href: "https://medium.com/@becccasun/rationale-for-dropping-architecture-35ecb9c59d98",
    date: "2026-02-05T07:21:57.000Z",
    dateLabel: "Feb 2026",
    publication: null,
    minutes: 5,
    excerpt:
      "I think it's definitely true when people say that you have to take some risks and make some mistakes before you realize just how little you know.",
    image:
      "https://cdn-images-1.medium.com/v2/resize:fit:1024/1*4lulUSy8XRVdqsj1Qz96_w.png",
    tags: [],
  },
  {
    id: "what-makes-architectural-design-special-3508abfa263e",
    series: "Design Notebook #1",
    title: "What Makes Architectural Design Special?",
    href: "https://medium.com/@becccasun/what-makes-architectural-design-special-3508abfa263e",
    date: "2025-10-27T00:41:25.000Z",
    dateLabel: "Oct 2025",
    publication: null,
    minutes: 3,
    excerpt:
      "Written by a second-year architecture student determined to understand the impact and potential of our built environment.",
    image:
      "https://cdn-images-1.medium.com/v2/resize:fit:1024/1*WkLlHKN_w5CZiqaOPSGDug.jpeg",
    tags: ["design", "architecture", "education"],
  },
];
