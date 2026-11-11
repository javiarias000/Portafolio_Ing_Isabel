// Pruebas de navegador (Chrome instalado + playwright-core). Requiere el sitio servido: npx serve public -l 8080
import { chromium } from 'playwright-core'; import assert from 'node:assert/strict';
const url = process.argv[2] || 'http://localhost:8080/';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
let n = 0; const ok = m => console.log('ok', ++n, m);
for (const w of [320, 768, 1440]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 800 } })).newPage(); const errs = [];
  p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 80)); } });
  assert.equal(await p.evaluate(() => document.documentElement.scrollWidth), w, 'scroll horizontal a ' + w);
  assert.deepEqual(errs, []); ok(`sin errores de consola ni scroll horizontal a ${w}px`);
  await p.close();
}
const ctx = await b.newContext({ viewport: { width: 390, height: 700 } }); const p = await ctx.newPage();
await p.goto(url, { waitUntil: 'networkidle' });
const cta = await p.locator('#hero-cta').boundingBox(); assert.ok(cta.y + cta.height < 700, 'CTA WhatsApp visible sin scroll en móvil'); ok('CTA WhatsApp visible sin scroll (390x700)');
const was = await p.$$eval('a[data-wa]', as => as.map(a => a.href)); assert.ok(was.length >= 12 && was.every(h => /^https:\/\/wa\.me\/593987738663(\?text=.+)?$/.test(h))); ok(`${was.length} enlaces wa.me válidos`);
await p.fill('#engrave-in', 'María José'); assert.equal(await p.textContent('#engrave-out'), 'María José');
assert.ok((await p.getAttribute('#engrave-wa', 'href')).includes(encodeURIComponent('María José'))); ok('nombre grabado actualiza caja y enlace');
await p.evaluate(() => document.getElementById('bitacora').scrollIntoView({ behavior: 'instant' })); await p.waitForTimeout(500);
const cards = await p.$$eval('#log-grid .card', c => c.length); assert.ok(cards >= 12); ok(`bitácora carga por lotes (${cards} tarjetas iniciales)`);
await p.evaluate(async () => { for (let i = 0; i < 40; i++) { document.getElementById('log-sentinel').scrollIntoView({ behavior: 'instant' }); document.getElementById('log-more').hidden || document.getElementById('log-more').click(); await new Promise(r => setTimeout(r, 120)); } });
const all = await p.evaluate(() => ({ n: document.querySelectorAll('#log-grid .card').length, txt: document.getElementById('log-status').textContent, links: [...document.querySelectorAll('.card__link')].every(a => a.href.startsWith('https://www.facebook.com/')), test: [...document.querySelectorAll('.card__msg')].some(m => m.textContent.trim() === 'Test'), lazy: [...document.querySelectorAll('.card img')].every(i => i.loading === 'lazy' || i.closest('.card') === document.querySelector('.card')) }));
assert.equal(all.n, 118); assert.ok(all.links && !all.test && all.lazy); ok('118 tarjetas, enlaces a Facebook, sin posts de prueba, imágenes lazy');
const dates = await p.$$eval('#log-grid .card__date', d => d.length); assert.equal(dates, 118);
await p.evaluate(() => document.getElementById('portafolio').scrollIntoView({ behavior: 'instant' }));
await p.focus('[data-piece="pf-robot"]'); await p.keyboard.press('Enter'); assert.ok(await p.$eval('#lightbox', d => d.open)); await p.keyboard.press('Escape');
assert.ok(!(await p.$eval('#lightbox', d => d.open))); assert.equal(await p.evaluate(() => document.activeElement.dataset.piece), 'pf-robot'); ok('lightbox: Enter abre, Escape cierra y devuelve el foco');
await ctx.close();
const rm = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const q = await rm.newPage();
await q.goto(url, { waitUntil: 'networkidle' });
const vis = await q.evaluate(() => [...document.querySelectorAll('[data-reveal]')].every(e => getComputedStyle(e).opacity === '1' && getComputedStyle(e).transform === 'none')); assert.ok(vis); ok('prefers-reduced-motion: contenido visible sin desplazamientos');
const nojs = await (await b.newContext({ javaScriptEnabled: false })).newPage(); await nojs.goto(url);
assert.ok(await nojs.$eval('#hero-cta', a => a.href.startsWith('https://wa.me/593987738663'))); assert.ok(await nojs.$eval('h1', h => getComputedStyle(h).opacity === '1')); ok('sin JavaScript: contenido y CTA funcionan');
await b.close(); console.log('e2e: todo ok');
