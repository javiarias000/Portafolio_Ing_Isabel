// Auditoría automática WCAG 2.1 AA con axe-core sobre el sitio servido.
import { chromium } from 'playwright-core'; import fs from 'node:fs'; import { createRequire } from 'node:module';
const axeSrc = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const url = process.argv[2] || 'http://localhost:8080/';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
let bad = 0;
for (const w of [390, 1440]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 100)); } });
  await p.waitForTimeout(700);
  await p.evaluate(axeSrc);
  const r = await p.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] }));
  console.log(`--- ${w}px: ${r.violations.length} violaciones, ${r.passes.length} reglas ok`);
  for (const v of r.violations) { bad++; console.log(v.impact, v.id, v.help, v.nodes.length, v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')); }
  await p.close();
}
await b.close(); process.exit(bad ? 1 : 0);
