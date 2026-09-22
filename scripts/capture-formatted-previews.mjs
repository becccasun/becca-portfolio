import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const BASE = "http://127.0.0.1:43123";
const OUT_DIR =
  "/cursor/stores/bc-05866d75-138d-4e32-8516-5c3e987732c5/media";

async function loadLazyImages(page) {
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
        /* ignore */
      }
    }
    window.scrollTo(0, 0);
    await delay(150);
  });
}

/** Union clip from hero through N sections that contain formatted blocks. */
async function clipForFormattedBlocks(page, sectionIds) {
  return page.evaluate((ids) => {
    const hero = document.querySelector('[class*="hero"]');
    const head = document.querySelector("header");
    const top = (hero ?? head)?.getBoundingClientRect().top ?? 0;
    const scrollY = window.scrollY;
    const nodes = [];
    if (hero) nodes.push(hero);
    if (head) nodes.push(head);
    for (const id of ids) {
      const sec = document.getElementById(id);
      if (sec) nodes.push(sec);
    }
    const metric = document.querySelector('[class*="metricStrip"]');
    if (metric) nodes.push(metric);
    let minY = Infinity;
    let maxY = -Infinity;
    for (const n of nodes) {
      const r = n.getBoundingClientRect();
      minY = Math.min(minY, r.top);
      maxY = Math.max(maxY, r.bottom);
    }
    const pad = 24;
    const x = 0;
    const y = Math.max(0, minY + scrollY - pad);
    const width = Math.min(document.documentElement.clientWidth, 1440);
    const height = Math.min(
      maxY - minY + pad * 2,
      2200,
    );
    return { x, y: y - scrollY, width, height, scrollY };
  }, sectionIds);
}

async function captureClip(page, clip, outPath) {
  await page.evaluate((y) => window.scrollTo(0, Math.max(0, y)), clip.scrollY ?? 0);
  await page.waitForTimeout(200);
  const viewport = page.viewportSize();
  await page.screenshot({
    path: outPath,
    clip: {
      x: Math.max(0, clip.x),
      y: Math.max(0, clip.y),
      width: Math.min(clip.width, viewport.width),
      height: Math.min(clip.height, 1200),
    },
  });
}

async function captureTallComposite(page, sectionIds, outPath, viewportWidth) {
  const clips = [];
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);

  const topClip = await clipForFormattedBlocks(page, sectionIds.slice(0, 1));
  const bodyBox = await page.evaluate(() => {
    const grids = document.querySelectorAll("article > div");
    const layout = grids[grids.length - 1];
    const body = layout?.querySelector(":scope > div:last-child");
    const r = body?.getBoundingClientRect();
    const w = r?.width ?? 0;
    if (w > 100) {
      return { x: r.left, y: r.top, width: r.width, height: r.height };
    }
    return {
      x: 0,
      y: 0,
      width: document.documentElement.clientWidth,
      height: 900,
    };
  });

  const topBuf = await page.screenshot({
    type: "png",
    clip: {
      x: Math.max(0, bodyBox.x),
      y: Math.max(0, topClip.y),
      width: Math.min(bodyBox.width, viewportWidth - bodyBox.x),
      height: Math.min(topClip.height, 1100),
    },
  });

  const midId = sectionIds[1] ?? sectionIds[0];
  if (midId) {
    await page.locator(`#${midId}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
  }
  const midClip = await page.evaluate((id) => {
    const grids = document.querySelectorAll("article > div");
    const layout = grids[grids.length - 1];
    const body =
      layout?.querySelector(":scope > div:last-child") ?? document.querySelector("article");
    const sec = document.getElementById(id);
    if (!sec || !body) return null;
    const br = body.getBoundingClientRect();
    const r = sec.getBoundingClientRect();
    const pad = 16;
    return {
      x: Math.max(0, br.left),
      y: Math.max(0, r.top - pad),
      width: Math.min(br.width, document.documentElement.clientWidth - br.left),
      height: Math.min(r.height + pad * 2, 1000),
    };
  }, midId);

  if (!midClip) {
    fs.writeFileSync(outPath, topBuf);
    return;
  }

  const midBuf = await page.screenshot({
    type: "png",
    clip: {
      x: 0,
      y: midClip.y,
      width: viewportWidth,
      height: midClip.height,
    },
  });

  const topMeta = await sharp(topBuf).metadata();
  const midMeta = await sharp(midBuf).metadata();
  const w = Math.max(topMeta.width ?? 0, midMeta.width ?? 0);
  const h = (topMeta.height ?? 0) + (midMeta.height ?? 0);
  const topPng = await sharp(topBuf).resize({ width: w }).png().toBuffer();
  const midPng = await sharp(midBuf).resize({ width: w }).png().toBuffer();

  await sharp({
    create: {
      width: w,
      height: h,
      channels: 3,
      background: "#fbfbfb",
    },
  })
    .composite([
      { input: topPng, top: 0, left: 0 },
      { input: midPng, top: topMeta.height ?? 0, left: 0 },
    ])
    .png()
    .toFile(outPath);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = [];

  const onboardingUrl = `${BASE}/work/loop-onboarding`;
  const mcpUrl = `${BASE}/work/loop-design-ai-mcp`;

  // Onboarding desktop
  const od = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await od.goto(onboardingUrl, { waitUntil: "domcontentloaded" });
  await od.waitForTimeout(600);
  await loadLazyImages(od);
  const odPath = path.join(OUT_DIR, "onboarding-formatted-desktop.png");
  await captureTallComposite(
    od,
    ["problem", "research", "ai"],
    odPath,
    1440,
  );
  report.push({ path: odPath, url: onboardingUrl, bytes: fs.statSync(odPath).size });
  await od.close();

  // Onboarding mobile
  const om = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await om.goto(onboardingUrl, { waitUntil: "domcontentloaded" });
  await om.waitForTimeout(600);
  await loadLazyImages(om);
  const omPath = path.join(OUT_DIR, "onboarding-formatted-mobile.png");
  await captureTallComposite(om, ["problem", "data"], omPath, 390);
  report.push({ path: omPath, url: onboardingUrl, bytes: fs.statSync(omPath).size });
  await om.close();

  // MCP desktop
  const md = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await md.goto(mcpUrl, { waitUntil: "domcontentloaded" });
  await md.waitForTimeout(600);
  await loadLazyImages(md);
  const mdPath = path.join(OUT_DIR, "mcp-formatted-desktop.png");
  await captureTallComposite(md, ["direction", "skills", "governance"], mdPath, 1440);
  report.push({ path: mdPath, url: mcpUrl, bytes: fs.statSync(mdPath).size });
  await md.close();

  await browser.close();
  console.log(JSON.stringify(report, null, 2));
  for (const r of report) {
    if (!r.bytes) process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
