import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { writeFileSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
copyFileSync("/workspace/.grok/favicon.svg.tmp", join(dir, "favicon.svg"));

writeFileSync(
  join(dir, "favicon-preview.html"),
  `<!DOCTYPE html>
<html><head><style>
html,body{margin:0;background:#8a8680}
.row{display:flex;gap:20px;padding:20px;align-items:end}
.box{background:#d9d4cb;padding:10px;border-radius:6px}
img{display:block;image-rendering:pixelated}
label{display:block;font:12px sans-serif;color:#222;margin-top:6px;text-align:center}
</style></head><body>
<div class="row">
  <div class="box"><img src="favicon.svg" width="16" height="16"><label>16</label></div>
  <div class="box"><img src="favicon.svg" width="32" height="32"><label>32</label></div>
  <div class="box"><img src="favicon.svg" width="64" height="64"><label>64</label></div>
  <div class="box"><img src="favicon.svg" width="180" height="180"><label>180</label></div>
</div>
</body></html>`,
);

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(join(dir, "og-card.html")).href, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(dir, "og-card.png"), type: "png" });
  console.log("wrote og-card.png");

  const fav = await browser.newPage({ viewport: { width: 520, height: 260 }, deviceScaleFactor: 2 });
  await fav.goto(pathToFileURL(join(dir, "favicon-preview.html")).href, { waitUntil: "networkidle" });
  await fav.screenshot({ path: join(dir, "favicon-preview.png"), type: "png" });
  console.log("wrote favicon-preview.png");
} finally {
  await browser.close();
}
