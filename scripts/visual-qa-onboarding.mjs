import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const URL = "http://127.0.0.1:43123/work/loop-onboarding";
const OUT_DIR =
  "/cursor/stores/bc-05866d75-138d-4e32-8516-5c3e987732c5/media";

const shots = {
  desktop: path.join(OUT_DIR, "onboarding-desktop.png"),
  mobile: path.join(OUT_DIR, "onboarding-mobile.png"),
  demo: path.join(OUT_DIR, "onboarding-demo.png"),
};

async function scrollToLoadImages(page) {
  await page.evaluate(async () => {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    const root = document.querySelector("main") ?? document.body;
    const imgs = [...root.querySelectorAll("img")];
    for (const img of imgs) {
      const style = getComputedStyle(img);
      if (style.display === "none" || style.visibility === "hidden") continue;
      img.scrollIntoView({ block: "center", behavior: "instant" });
      await delay(40);
      try {
        await img.decode();
      } catch {
        await new Promise((resolve) => {
          if (img.complete) resolve();
          else {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          }
        });
      }
    }
    window.scrollTo(0, 0);
    await delay(200);
  });
}

async function auditImages(page, viewportLabel) {
  return page.evaluate((label) => {
    const imgs = [...document.querySelectorAll("main img, article img, img")].filter(
      (img) => img.closest("header") === null,
    );
    const issues = [];
    const rows = [];

    for (const img of imgs) {
      const rect = img.getBoundingClientRect();
      const style = getComputedStyle(img);
      const parentWell = img.closest("[class*='well']");
      const parentRect = parentWell?.getBoundingClientRect();
      const src = img.currentSrc || img.src;
      const broken = !img.complete || img.naturalWidth === 0;
      const zeroLayout =
        rect.width < 2 || rect.height < 2 || style.display === "none";
      const hiddenButExpected =
        zeroLayout && img.closest("[class*='fallback']") && label === "desktop";

      if (broken) {
        issues.push({ type: "broken", src, alt: img.alt });
      }
      if (zeroLayout && !hiddenButExpected) {
        issues.push({
          type: "zero-size",
          src,
          alt: img.alt,
          w: rect.width,
          h: rect.height,
        });
      }

      const wellW = parentRect?.width ?? 0;
      const scaleMismatch =
        wellW > 40 &&
        rect.width > wellW * 1.08 &&
        !img.closest("[class*='gallery']");

      if (scaleMismatch) {
        issues.push({
          type: "overflow-scale",
          src,
          imgW: rect.width,
          wellW,
        });
      }

      rows.push({
        src: src.split("/").slice(-2).join("/"),
        nw: img.naturalWidth,
        nh: img.naturalHeight,
        dw: Math.round(rect.width),
        dh: Math.round(rect.height),
      });
    }

    const doc = document.documentElement;
    const overflowX = doc.scrollWidth - window.innerWidth;

    return { issues, rows, overflowX, viewport: label };
  }, viewportLabel);
}

async function auditDemoDesktop(page) {
  const iframe = page.locator('iframe[title*="V3.7"]');
  await iframe.waitFor({ state: "attached", timeout: 15000 });
  const box = await iframe.boundingBox();
  const visible = await iframe.isVisible();
  const frame = page.frameLocator('iframe[title*="V3.7"]');
  let innerText = "";
  let hasForm = false;
  try {
    await frame.locator("body").waitFor({ timeout: 20000 });
    innerText = (await frame.locator("body").innerText()).slice(0, 200);
    hasForm = (await frame.locator("input, button, select").count()) > 0;
  } catch (e) {
    return {
      ok: false,
      visible,
      box,
      error: String(e),
      innerText,
      hasForm,
    };
  }
  return {
    ok: visible && box && box.width > 100 && box.height > 100 && hasForm,
    visible,
    box,
    innerText,
    hasForm,
  };
}

async function auditDemoMobile(page) {
  const iframe = page.locator('iframe[title*="V3.7"]');
  const iframeVisible = await iframe.isVisible();
  const fallbackImg = page
    .locator('iframe[title*="V3.7"]')
    .locator("xpath=ancestor::figure[1]//img")
    .first();
  const fallbackVisible = await fallbackImg.isVisible();
  const link = page.getByRole("link", { name: /open interactive prototype/i });
  const linkVisible = await link.first().isVisible();
  return { iframeVisible, fallbackVisible, linkVisible };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const findings = { desktop: {}, mobile: {}, demo: {} };

  // Desktop full page
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await scrollToLoadImages(desktop);
  findings.desktop.images = await auditImages(desktop, "desktop");
  findings.desktop.demo = await auditDemoDesktop(desktop);

  await desktop.locator("#ai").scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(1500);
  const demoFigure = desktop.locator("#ai iframe[title*='V3.7']").locator(
    "xpath=ancestor::figure[1]",
  );
  await demoFigure.screenshot({ path: shots.demo });
  await desktop.screenshot({ path: shots.desktop, fullPage: true });

  // Mobile full page
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await scrollToLoadImages(mobile);
  findings.mobile.images = await auditImages(mobile, "mobile");
  findings.mobile.demo = await auditDemoMobile(mobile);
  await mobile.screenshot({ path: shots.mobile, fullPage: true });

  await browser.close();

  const report = {
    findings,
    shots: Object.fromEntries(
      Object.entries(shots).map(([k, p]) => [k, { path: p, bytes: fs.statSync(p).size }]),
    ),
  };

  console.log(JSON.stringify(report, null, 2));

  const allIssues = [
    ...findings.desktop.images.issues,
    ...findings.mobile.images.issues,
  ];
  const overflowMobile = findings.mobile.images.overflowX > 2;
  const demoOk =
    findings.desktop.demo.ok &&
    !findings.mobile.demo.iframeVisible &&
    findings.mobile.demo.fallbackVisible;

  if (allIssues.length || overflowMobile || !demoOk) {
    process.exitCode = 2;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
