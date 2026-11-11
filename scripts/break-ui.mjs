// Prueba de estrés de la bitácora con datos de peor caso (se inyectan en el borde: la respuesta de timeline.json).
import { chromium } from 'playwright-core'; import fs from 'node:fs';
const url = process.argv[2] || 'http://localhost:8080/';
const real = JSON.parse(fs.readFileSync('data/timeline.json', 'utf8'));
const img = real.entries.find(e => e.images.length).images[0];
const long = 'Retratos personalizados en madera grabada, regalo para mamá y papá, con nombre, fecha y dedicatoria. ' .repeat(40);
const mk = (o, i) => ({ id: 'x' + i, images: [img], message: 'Mensaje', count: 1, latest: '2026-05-19T10:00:17+0000', first: '2026-05-19T10:00:17+0000', dates: ['2026-05-19T10:00:17+0000'], permalink: 'https://www.facebook.com/x', ...o });
const cases = {
  worst: [mk({ message: long }, 1), mk({ message: 'https://www.facebook.com/photo.php?fbid=122102792342693206&set=a.122102751038693206&type=3&extra=' + 'a'.repeat(120) }, 2), mk({ images: [], message: 'Test largo sin imagen '.repeat(30) }, 3), mk({ images: [{ id: 'fb-noexiste', width: 400, height: 500, widths: [400] }] }, 4), mk({ count: 999, dates: Array(999).fill('2026-05-19T10:00:17+0000') }, 5), mk({ message: '' , images: []}, 6), mk({ message: '\n\n\n🎁🎁🎁 ¡¡¡OFERTA!!! 💕'.repeat(10) }, 7)],
  empty: [], one: [mk({}, 1)], many: Array.from({ length: 400 }, (_, i) => mk({ message: 'Publicación ' + i }, i)),
};
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
const b = await chromium.launch({ executablePath: exe });
for (const [name, entries] of Object.entries(cases)) for (const w of [320, 1440]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 800 } })).newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.route('**/data/timeline.json', r => r.fulfill({ json: { ...real, entries, total: entries.reduce((s, e) => s + e.count, 0) } }));
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.getElementById('bitacora').scrollIntoView({ behavior: 'instant' }));
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cards: document.querySelectorAll('.card').length, status: document.getElementById('log-status').textContent, moreVisible: !document.getElementById('log-more').hidden, over: [...document.querySelectorAll('#log-grid *')].filter(e => e.getBoundingClientRect().right > document.documentElement.clientWidth + 1).length }));
  console.log(name, w, JSON.stringify(r), errs.length ? errs : '');
  if (name === 'worst') await p.locator('#log-grid').screenshot({ path: `.tmp/shots/break-${w}.png` });
  await p.close();
}
await b.close();
