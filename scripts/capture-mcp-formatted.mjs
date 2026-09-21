import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUT = "/cursor/stores/bc-05866d75-138d-4e32-8516-5c3e987732c5/media/mcp-formatted-desktop.png";
const URL = "http://127.0.0.1:43123/work/loop-design-ai-mcp";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(URL, { waitUntil: "domcontentloaded" });
  await desktop.waitForTimeout(800);
  await desktop.screenshot({ path: OUT, fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(URL, { waitUntil: "domcontentloaded" });
  await mobile.waitForTimeout(600);
  const audit = await mobile.evaluate(() => {
    const ms = document.querySelector('[class*="metricStrip"]');
    const card = document.querySelector('[class*="cardGrid"] article, [class*="card__"]');
    return {
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      metricBorder: ms ? getComputedStyle(ms).borderWidth : null,
      cardBorder: card ? getComputedStyle(card).borderWidth : null,
      callout: document.querySelector('[class*="callout"]')
        ? getComputedStyle(document.querySelector('[class*="callout"]')).borderLeftWidth
        : null,
    };
  });

  await browser.close();
  const bytes = fs.statSync(OUT).size;
  console.log(JSON.stringify({ file: OUT, bytes, mobile390: audit }, null, 2));
  if (!bytes) process.exit(1);
}

main();
