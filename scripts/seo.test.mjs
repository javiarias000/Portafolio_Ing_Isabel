import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
import { render } from './build-site.mjs';
const root = new URL('../', import.meta.url);
const tpl = fs.readFileSync(new URL('site/index.html', root), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('public/assets/img/manifest.json', root), 'utf8'));
const html = render(tpl, manifest, 'https://midea.example');
const bare = render(tpl, manifest, '');
test('title y meta description dentro de límites', () => {
  const title = html.match(/<title>(.*?)<\/title>/)[1]; assert.ok(title.length <= 60, title.length);
  const d = html.match(/name="description" content="([^"]+)"/)[1]; assert.ok(d.length >= 80 && d.length <= 160, d.length);
});
test('canonical, og:image y twitter con SITE_URL; sin él no hay canonical roto', () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/midea\.example\/">/);
  assert.match(html, /og:image" content="https:\/\/midea\.example\/assets\/img\/og-1200x630\.jpg"/);
  assert.match(html, /twitter:card" content="summary_large_image"/);
  assert.doesNotMatch(bare, /rel="canonical"/); assert.doesNotMatch(bare, /%%SITE_URL%%/);
});
test('JSON-LD LocalBusiness válido', () => {
  for (const h of [html, bare]) {
    const j = JSON.parse(h.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/)[1]);
    assert.equal(j['@type'], 'LocalBusiness'); assert.equal(j.telephone, '+593987738663'); assert.equal(j.address.addressLocality, 'Ambato');
  }
});
test('un solo h1, todas las imágenes con alt, ids de ancla existentes', () => {
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
  assert.ok([...html.matchAll(/<img\b[^>]*>/g)].filter(m => !m[0].includes('id="lb-img"')).every(m => /\balt="[^"]+"/.test(m[0]) && /\bwidth=/.test(m[0]) && /\bheight=/.test(m[0])));
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes(`id="${id}"`), id);
});
test('pie dice © 2026 y no hay Markdown ni errores de ortografía conocidos', () => {
  assert.match(html, /&copy; 2026 Villena Cárdenas María Isabel/);
  assert.doesNotMatch(html, /\*\*|secunciaci|Publos|lampara/);
});
test('sin secretos ni token de Meta en el repo publicado', () => {
  for (const f of ['public/index.html', 'site/index.html', 'site/js/main.js', 'site/js/timeline.js']) assert.doesNotMatch(fs.readFileSync(new URL(f, root), 'utf8'), /EAA[A-Za-z0-9]{20,}/);
});
test('el HTML no usa estilos ni scripts en línea (compatible con CSP script-src self)', () => {
  assert.doesNotMatch(html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, ''), /<script(?![^>]*\bsrc=)[^>]*>|\sstyle="/);
});
