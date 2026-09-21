import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = "http://127.0.0.1:43123";
const OUT_DIR =
  "/cursor/stores/bc-05866d75-138d-4e32-8516-5c3e987732c5/media";

const pages = [
  {
    slug: "loop-onboarding",
    desktop: "onboarding-formatted-desktop.png",
    mobile: "onboarding-formatted-mobile.png",
  },
  {
    slug: "loop-design-ai-mcp",
    desktop: "mcp-formatted-desktop.png",
    mobile: null,
  },
];

async function loadImages(page) {
  await page.evaluate(async () => {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    const root = document.querySelector("main") ?? document.body;
    for (const img of root.querySelectorAll("img")) {
      if (getComputedStyle(img).display === "none") continue;
      img.scrollIntoView({ block: "center", behavior: "instant" });
      await delay(30);
      try {
        await img.decode();
      } catch {
        /* lazy */
      }
    }
    window.scrollTo(0, 0);
    await delay(150);
  });
}

async function audit(page, label) {
  return page.evaluate((viewportLabel) => {
    const issues = [];
    const blocks = {
      metric: document.querySelectorAll("[class*='metricStrip']").length,
      callout: document.querySelectorAll("[class*='callout']").length,
      cards: document.querySelectorAll("[class*='cardGrid']").length,
      pull: document.querySelectorAll("[class*='pullquote']").length,
    };
    for (const img of document.querySelectorAll("main img")) {
      const rect = img.getBoundingClientRect();
      if (getComputedStyle(img).display === "none") continue;
      if (!img.complete || img.naturalWidth === 0) {
        issues.push({ type: "broken", src: img.src });
      }
      if (rect.height < 2 && rect.width > 10) {
        issues.push({ type: "zero-height", src: img.src });
      }
    }
    const overflow =
      document.documentElement.scrollWidth - window.innerWidth;
    return { blocks, issues, overflow, viewportLabel };
  }, label);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = { pages: [] };

  for (const p of pages) {
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await desktop.goto(`${BASE}/work/${p.slug}`, {
      waitUntil: "domcontentloaded",
    });
    await desktop.waitForTimeout(600);
    await loadImages(desktop);
    const desktopAudit = await audit(desktop, "desktop");
    const desktopPath = path.join(OUT_DIR, p.desktop);
    await desktop.screenshot({ path: desktopPath, fullPage: true });
    report.pages.push({
      slug: p.slug,
      desktop: { audit: desktopAudit, file: desktopPath, bytes: fs.statSync(desktopPath).size },
    });
    await desktop.close();

    if (p.mobile) {
      const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await mobile.goto(`${BASE}/work/${p.slug}`, { waitUntil: "domcontentloaded" });
      await mobile.waitForTimeout(600);
      await loadImages(mobile);
      const mobileAudit = await audit(mobile, "mobile");
      const mobilePath = path.join(OUT_DIR, p.mobile);
      await mobile.screenshot({ path: mobilePath, fullPage: true });
      report.pages.push({
        slug: p.slug,
        mobile: { audit: mobileAudit, file: mobilePath, bytes: fs.statSync(mobilePath).size },
      });
      await mobile.close();
    }
  }

  await browser.close();
  console.log(JSON.stringify(report, null, 2));
  const issues = report.pages.flatMap((x) => [
    ...(x.desktop?.audit.issues ?? []),
    ...(x.mobile?.audit.issues ?? []),
  ]);
  if (issues.length) process.exitCode = 2;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
