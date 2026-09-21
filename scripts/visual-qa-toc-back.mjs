import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = "http://127.0.0.1:43123";
const CASE = `${BASE}/work/loop-onboarding`;
const OUT_DIR =
  "/cursor/stores/bc-05866d75-138d-4e32-8516-5c3e987732c5/media";

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(CASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);

  const back = page.getByRole("link", { name: "← All work" }).first();
  await back.scrollIntoViewIfNeeded();
  await back.waitFor({ state: "visible" });
  const href = await back.getAttribute("href");

  const layout = await page.evaluate(() => {
    const grids = document.querySelectorAll("article > div");
    const grid = grids[grids.length - 1];
    if (!grid || grid.children.length < 2) return null;
    const [sidebar, body] = [...grid.children];
    const g = getComputedStyle(grid);
    return {
      gridTemplateColumns: g.gridTemplateColumns,
      columnGap: g.columnGap,
      sidebarW: Math.round(sidebar.getBoundingClientRect().width),
      bodyW: Math.round(body.getBoundingClientRect().width),
    };
  });

  const desktopPath = path.join(OUT_DIR, "toc-back-desktop.png");
  await page.screenshot({ path: desktopPath, fullPage: false });

  await back.click();
  await page.waitForURL("**/work");
  const worksUrl = page.url();
  const worksHeading = await page.locator("h1").innerText();

  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto(CASE, { waitUntil: "domcontentloaded" });
  await mobilePage.waitForTimeout(400);
  const tocVisible = await mobilePage
    .getByRole("navigation", { name: "Case study contents" })
    .isVisible()
    .catch(() => false);
  const mobilePath = path.join(OUT_DIR, "toc-back-mobile.png");
  await mobilePage.screenshot({ path: mobilePath, fullPage: false });

  await browser.close();

  const report = {
    backLink: { href, destination: "/work", label: "← All work" },
    navigation: { worksUrl, worksHeading },
    layout,
    mobile: { tocVisible },
    shots: {
      desktop: { path: desktopPath, bytes: fs.statSync(desktopPath).size },
      mobile: { path: mobilePath, bytes: fs.statSync(mobilePath).size },
    },
  };
  console.log(JSON.stringify(report, null, 2));

  if (href !== "/work" || !worksUrl.endsWith("/work")) process.exitCode = 2;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
