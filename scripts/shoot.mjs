// Capturas de verificación visual: node scripts/shoot.mjs [url] [outDir]  (usa Chrome instalado)
import { chromium } from 'playwright-core'; import fs from 'node:fs';
const url = process.argv[2] || 'http://localhost:8080/', out = process.argv[3] || '.tmp/shots';
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: exe });
for (const [name, w, h] of [['m320', 320, 700], ['m390', 390, 844], ['t768', 768, 1024], ['d1440', 1440, 900]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const errs = [];
  p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.screenshot({ path: `${out}/${name}-fold.png` });
  // revelar todo y cargar bitácora completa para captura de página
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 120)); } scrollTo({ top: 0, behavior: 'instant' }); });
  await p.waitForTimeout(800);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  await p.screenshot({ path: `${out}/${name}-full.png`, fullPage: true });
  console.log(name, 'scrollWidth', sw, 'errores:', errs.length, errs.slice(0, 3));
  await ctx.close();
}
await b.close();
