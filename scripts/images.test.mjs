import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { widthsFor } from './build-images.mjs';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/assets/img');
test('widthsFor no amplía', () => { assert.deepEqual(widthsFor(467, [480, 960]), [467]); assert.deepEqual(widthsFor(1024, [480, 960, 1600]), [480, 960, 1024]); });
test('cada id tiene todos sus anchos en avif, webp y jpg', () => {
  const m = JSON.parse(fs.readFileSync(path.join(OUT, 'manifest.json'), 'utf8'));
  assert.ok(Object.keys(m).length > 60);
  for (const [id, e] of Object.entries(m)) for (const w of e.widths) for (const f of ['avif', 'webp', 'jpg']) assert.ok(fs.existsSync(path.join(OUT, `${id}-${w}.${f}`)), `${id}-${w}.${f}`);
});
test('hero 960 avif < 120 KB y og existe', () => {
  assert.ok(fs.statSync(path.join(OUT, 'hero-navidad-960.avif')).size < 120 * 1024);
  assert.ok(fs.existsSync(path.join(OUT, 'og-1200x630.jpg')));
});
