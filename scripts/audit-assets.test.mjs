import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
import { auditAssets } from './audit-assets.mjs';
const SRC = new URL('../assets/src/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const r = auditAssets(decodeURIComponent(SRC));
test('no hay archivos duplicados por hash', () => assert.deepEqual(r.duplicates, []));
test('todos los nombres son ASCII-kebab', () => assert.deepEqual(r.badNames, []));
test('manifest apunta a archivos existentes y con alt', () => {
  const m = JSON.parse(fs.readFileSync(decodeURIComponent(SRC) + 'manifest.json', 'utf8'));
  assert.ok(m.length >= 6);
  for (const e of m) { assert.ok(fs.existsSync(decodeURIComponent(SRC) + e.file), e.file); assert.ok(e.alt && e.alt.length > 10, e.id); assert.ok(e.id && e.title); }
});
