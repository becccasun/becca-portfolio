import { chromium } from "playwright";
import fs from "fs";

const BASE = "http://127.0.0.1:43123";
const OUT_DIR =
  "/cursor/stores/bc-05866d75-138d-4e32-8516-5c3e987732c5/media";

function bodyColumn(page) {
  return page.evaluate(() => {
    const layout = document.querySelector('[class*="page_layout"]');
    const lr = layout?.getBoundingClientRect();
    if (!lr) return null;
    const nav = document.querySelector(
      'nav[aria-label="Case study contents"], nav[aria-label*="projects"]',
    );
    const nr = nav?.getBoundingClientRect();
    if (nr && nr.width > 40 && getComputedStyle(nav).display !== "none") {
      const left = nr.right + 16;
      const width = lr.right - left;
      if (width > 200) return { left, width };
    }
    return { left: lr.left, width: lr.width };
  });
}

async function scrollPairInBody(page, metricSel, cardSel, width, pad = 28) {
  const measure = await page.evaluate(
    ({ metricSel, cardSel }) => {
      const metric = document.querySelector(metricSel);
      const cards = document.querySelector(cardSel);
      if (!metric || !cards) return { ok: false };
      const mr = metric.getBoundingClientRect();
      const cr = cards.getBoundingClientRect();
      const top = Math.min(mr.top + window.scrollY, cr.top + window.scrollY);
      const bottom = Math.max(mr.bottom + window.scrollY, cr.bottom + window.scrollY);
      return { ok: true, top, needH: bottom - top };
    },
    { metricSel, cardSel },
  );
  if (!measure.ok) return measure;

  const height = Math.min(2000, Math.ceil(measure.needH + pad * 2 + 32));
  await page.setViewportSize({ width, height });
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, measure.top - pad));
  await page.waitForTimeout(450);

  const col = await bodyColumn(page);

  const check = await page.evaluate(
    ({ metricSel, cardSel, pad }) => {
      const metric = document.querySelector(metricSel);
      const cards = document.querySelector(cardSel);
      const vh = window.innerHeight;
      const ok = [metric, cards].every((el) => {
        const r = el.getBoundingClientRect();
        return r.top >= pad && r.bottom <= vh - pad;
      });
      const toc = document.querySelector("nav[aria-label='Case study contents']");
      const tr = toc?.getBoundingClientRect();
      const overlapsToc =
        tr &&
        [metric, cards].some((el) => {
          const r = el.getBoundingClientRect();
          return r.left < tr.right && r.right > tr.left;
        });
      return { ok, overlapsToc };
    },
    { metricSel, cardSel, pad },
  );

  return { ...measure, height, col, check, ok: measure.ok };
}

async function screenshotBody(page, outPath, col) {
  await page.screenshot({
    path: outPath,
    fullPage: false,
    clip: {
      x: Math.max(0, Math.floor(col.left)),
      y: 0,
      width: Math.floor(col.width),
      height: Math.min(
        (await page.viewportSize()).height,
        await page.evaluate(() => window.innerHeight),
      ),
    },
  });
  return fs.statSync(outPath).size;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const report = [];

  const odUrl = `${BASE}/work/loop-onboarding`;
  const mdUrl = `${BASE}/work/loop-design-ai-mcp`;

  // Onboarding desktop — body column only (no TOC)
  const odPath = `${OUT_DIR}/onboarding-formatted-desktop.png`;
  const od = await browser.newPage();
  await od.setViewportSize({ width: 1440, height: 900 });
  await od.goto(odUrl, { waitUntil: "domcontentloaded" });
  await od.waitForTimeout(1000);
  let odFit = await scrollPairInBody(
    od,
    "#problem [class*='metricStrip']",
    "#research [class*='cardGrid']",
    1440,
  );
  if (!odFit.ok) {
    odFit = await scrollPairInBody(
      od,
      "#ai [class*='metricStrip']",
      "#data [class*='cardGrid']",
      1440,
    );
  }
  let colOd = odFit.col ?? (await bodyColumn(od));
  if (!colOd) {
    colOd = await od.evaluate(() => ({
      left: 0,
      width: document.documentElement.clientWidth,
    }));
  }
  const odBytes = await screenshotBody(od, odPath, colOd);
  report.push({ path: odPath, url: odUrl, bytes: odBytes, fit: odFit });
  await od.close();

  // Onboarding mobile — research CardGrid, body column clip
  const omPath = `${OUT_DIR}/onboarding-formatted-mobile.png`;
  const om = await browser.newPage();
  await om.setViewportSize({ width: 390, height: 844 });
  await om.goto(odUrl, { waitUntil: "domcontentloaded" });
  await om.waitForTimeout(1000);
  await om.locator("#research [class*='cardGrid']").scrollIntoViewIfNeeded();
  await om.waitForTimeout(400);
  const gridBox = await om.evaluate(() => {
    const g = document.querySelector("#research [class*='cardGrid']");
    const r = g?.getBoundingClientRect();
    return r ? { top: r.top, height: r.height } : null;
  });
  const mh = Math.max(
    620,
    Math.min(900, Math.ceil((gridBox?.height ?? 400) + 100)),
  );
  await om.setViewportSize({ width: 390, height: mh });
  await om.locator("#research [class*='cardGrid']").scrollIntoViewIfNeeded();
  await om.waitForTimeout(450);
  const colOm = await bodyColumn(om);
  const omBytes = colOm
    ? await screenshotBody(om, omPath, colOm)
    : (await om.screenshot({ path: omPath, fullPage: false }),
      fs.statSync(omPath).size);
  report.push({ path: omPath, url: odUrl, bytes: omBytes, viewport: { width: 390, height: mh } });
  await om.close();

  // MCP desktop — direction section, body column only
  const mdPath = `${OUT_DIR}/mcp-formatted-desktop.png`;
  const md = await browser.newPage();
  await md.setViewportSize({ width: 1440, height: 820 });
  await md.goto(mdUrl, { waitUntil: "domcontentloaded" });
  await md.waitForTimeout(1000);
  await md.locator("#direction").scrollIntoViewIfNeeded();
  await md.waitForTimeout(400);
  const mdCheck = await md.evaluate(() => {
    const section = document.getElementById("direction");
    const grid = section?.querySelector("[class*='cardGrid']");
    const callout = section?.querySelector("[class*='callout']");
    if (!grid || !callout) return { ok: false };
    const g = grid.getBoundingClientRect();
    const c = callout.getBoundingClientRect();
    const vh = window.innerHeight;
    return {
      ok: true,
      inView: g.top >= 20 && c.bottom <= vh - 20,
      scrollY: window.scrollY,
    };
  });
  const colMd = await bodyColumn(md);
  const mdBytes = colMd
    ? await screenshotBody(md, mdPath, colMd)
    : (await md.screenshot({ path: mdPath, fullPage: false }),
      fs.statSync(mdPath).size);
  report.push({ path: mdPath, url: mdUrl, bytes: mdBytes, fit: mdCheck });
  await md.close();

  await browser.close();
  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
