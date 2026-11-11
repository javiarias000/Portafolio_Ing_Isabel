// Deriva data/timeline.json desde data/posts.json: sin posts de prueba, agrupando repeticiones.
// Uso: node scripts/build-timeline.mjs
import { widthsFor, FB_TARGETS } from './lib.mjs';
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { fileURLToPath } from 'node:url';

const ts = d => Date.parse(d);
const isTest = m => (m || '').trim().toLowerCase() === 'test';

/** posts -> {entries, total, excluded}. imageInfo(file) -> {hash,width,height} */
export function buildTimeline(posts, imageInfo) {
  const valid = posts.filter(p => !isTest(p.message));
  const groups = new Map();
  for (const p of valid) {
    const infos = p.images.map(imageInfo);
    const imgKey = infos.map(i => i.hash).join('+');
    const key = `${imgKey}|${p.message.trim()}`;
    let g = groups.get(key);
    if (!g) {
      g = { id: 'p' + crypto.createHash('sha1').update(key).digest('hex').slice(0, 8), images: infos.map(i => ({ id: 'fb-' + i.hash, width: i.width, height: i.height, widths: widthsFor(i.width, FB_TARGETS) })), message: p.message.trim(), count: 0, dates: [], permalinks: [] };
      groups.set(key, g);
    }
    g.count++; g.dates.push(p.date); g.permalinks.push({ date: p.date, url: p.permalink });
  }
  const entries = [...groups.values()].map(g => {
    g.dates.sort((a, b) => ts(b) - ts(a)); g.permalinks.sort((a, b) => ts(b.date) - ts(a.date));
    return { id: g.id, images: g.images, message: g.message, count: g.count, latest: g.dates[0], first: g.dates[g.dates.length - 1], dates: g.dates, permalink: g.permalinks[0].url };
  }).sort((a, b) => ts(b.latest) - ts(a.latest));
  return { entries, total: valid.length, excluded: posts.length - valid.length };
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const sharp = (await import('sharp')).default;
  const { posts, page, fetchedAt } = JSON.parse(fs.readFileSync(path.join(root, 'data/posts.json'), 'utf8'));
  const cache = new Map();
  const files = new Set(posts.flatMap(p => p.images));
  for (const f of files) {
    const buf = fs.readFileSync(path.join(root, 'assets/src/fb', f));
    const m = await sharp(buf).metadata();
    cache.set(f, { hash: crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8), width: m.width, height: m.height });
  }
  const t = buildTimeline(posts, f => cache.get(f));
  const out = { generatedFrom: fetchedAt, page: { name: page.name, link: page.link }, total: t.total, excluded: t.excluded, entries: t.entries };
  fs.writeFileSync(path.join(root, 'data/timeline.json'), JSON.stringify(out));
  // fuente única de imágenes únicas para build-images
  const uniq = new Map(); for (const [f, i] of cache) if (!uniq.has(i.hash)) uniq.set(i.hash, f);
  fs.writeFileSync(path.join(root, 'data/fb-images.json'), JSON.stringify([...uniq].map(([hash, file]) => ({ id: 'fb-' + hash, file })), null, 0));
  console.log(`timeline: ${t.entries.length} tarjetas de ${t.total} publicaciones (${t.excluded} de prueba excluidas); ${uniq.size} imágenes únicas`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
