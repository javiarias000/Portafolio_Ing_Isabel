import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
import { buildTimeline } from './build-timeline.mjs';
const info = f => ({ hash: f.startsWith('a') ? 'aaaa1111' : f.startsWith('b') ? 'bbbb2222' : 'aaaa1111', width: 400, height: 500 });
const P = (id, date, message, images) => ({ id, date, message, permalink: 'https://fb/' + id, type: 'x', images });
test('excluye posts de prueba', () => {
  const t = buildTimeline([P('1', '2026-05-01T10:00:00+0000', 'Test', ['a1.jpg']), P('2', '2026-05-02T10:00:00+0000', 'Hola', ['b1.jpg'])], info);
  assert.equal(t.entries.length, 1); assert.equal(t.excluded, 1);
});
test('agrupa por imagen+mensaje y cuenta apariciones', () => {
  const t = buildTimeline([P('1', '2026-05-01T10:00:00+0000', '', ['a1.jpg']), P('2', '2026-05-03T10:00:00+0000', '', ['a2.jpg']), P('3', '2026-05-02T10:00:00+0000', 'otro', ['a3.jpg'])], info);
  assert.equal(t.entries.length, 2);
  const g = t.entries.find(e => e.count === 2);
  assert.equal(g.latest, '2026-05-03T10:00:00+0000'); assert.equal(g.permalink, 'https://fb/2'); assert.equal(g.dates.length, 2);
});
test('ordena por fecha más reciente primero y conserva total', () => {
  const t = buildTimeline([P('1', '2026-05-01T10:00:00+0000', 'a', ['a1.jpg']), P('2', '2026-05-09T10:00:00+0000', 'b', ['b1.jpg'])], info);
  assert.deepEqual(t.entries.map(e => e.latest.slice(0, 10)), ['2026-05-09', '2026-05-01']);
  assert.equal(t.total, 2);
});
test('data/timeline.json real: sin Test, ordenado, suma de count = posts válidos', () => {
  const posts = JSON.parse(fs.readFileSync(new URL('../data/posts.json', import.meta.url))).posts;
  const tl = JSON.parse(fs.readFileSync(new URL('../data/timeline.json', import.meta.url)));
  const valid = posts.filter(p => p.message.trim().toLowerCase() !== 'test').length;
  assert.equal(tl.entries.reduce((s, e) => s + e.count, 0), valid);
  assert.ok(tl.entries.every(e => e.message.trim().toLowerCase() !== 'test'));
  for (let i = 1; i < tl.entries.length; i++) assert.ok(tl.entries[i - 1].latest >= tl.entries[i].latest);
  assert.ok(tl.entries.every(e => e.permalink.startsWith('https://www.facebook.com/')));
});
