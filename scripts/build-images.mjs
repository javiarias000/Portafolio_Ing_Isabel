// Genera public/assets/img/<id>-<ancho>.{avif,webp,jpg} + manifest.json + og-1200x630.jpg
// Uso: node scripts/build-images.mjs   (idempotente: omite salidas más nuevas que el origen)
import fs from 'node:fs'; import path from 'node:path'; import sharp from 'sharp'; import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets/src'), OUT = path.join(ROOT, 'public/assets/img');
const FORMATS = { avif: { avif: { quality: 50, effort: 4 } }, webp: { webp: { quality: 75 } }, jpg: { jpeg: { quality: 80, mozjpeg: true } } };
import { widthsFor, FB_TARGETS, SITE_TARGETS } from './lib.mjs';
export { widthsFor };

async function encode(pipeline, out, fmt) {
  const [k, o] = Object.entries(FORMATS[fmt])[0];
  await pipeline.clone()[k](o).toFile(out);
}

export async function buildImages(srcDir = SRC, outDir = OUT, { force = false } = {}) {
  fs.mkdirSync(outDir, { recursive: true });
  const jobs = [];
  const site = JSON.parse(fs.readFileSync(path.join(srcDir, 'manifest.json'), 'utf8')).map(e => ({ id: e.id, file: path.join(srcDir, e.file), crop: e.crop, targets: SITE_TARGETS }));
  const fbList = fs.existsSync(path.join(ROOT, 'data/fb-images.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'data/fb-images.json'), 'utf8')) : [];
  const fb = fbList.map(e => ({ id: e.id, file: path.join(srcDir, 'fb', e.file), targets: FB_TARGETS }));
  const manifest = {};
  const queue = [...site, ...fb];
  const doOne = async e => {
    let base = sharp(e.file, { failOn: 'none' }).rotate();
    if (e.crop) base = sharp(await base.extract(e.crop).toBuffer());
    const meta = await sharp(await base.clone().toBuffer()).metadata();
    const widths = widthsFor(meta.width, e.targets);
    manifest[e.id] = { width: meta.width, height: meta.height, widths };
    const srcTime = fs.statSync(e.file).mtimeMs;
    for (const w of widths) for (const fmt of Object.keys(FORMATS)) {
      const out = path.join(outDir, `${e.id}-${w}.${fmt}`);
      if (!force && fs.existsSync(out) && fs.statSync(out).mtimeMs > srcTime) continue;
      let p = base.clone().resize({ width: w, withoutEnlargement: true });
      if (fmt === 'jpg') p = p.flatten({ background: '#ffffff' });
      await encode(p, out, fmt);
    }
  };
  const workers = Array.from({ length: 4 }, async () => { while (queue.length) await doOne(queue.shift()); });
  await Promise.all(workers);
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, Object.keys(manifest).sort().length ? undefined : 0));
  await buildOg(srcDir, outDir);
  return manifest;
}

async function buildOg(srcDir, outDir) {
  const W = 1200, H = 630;
  const ad = await sharp(path.join(srcDir, 'hero-navidad.jpg')).resize({ height: H }).toBuffer();
  const adMeta = await sharp(ad).metadata();
  const logo = await sharp(path.join(srcDir, 'fb', fbFile('25417f3a'))).resize({ width: 440 }).toBuffer();
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W - adMeta.width}" height="${H}"><rect width="100%" height="100%" fill="#D66A2B"/><rect x="48" y="90" width="${W - adMeta.width - 96}" height="${H - 180}" fill="#F4E9D8"/></svg>`);
  const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W - adMeta.width - 96}" height="150"><text x="50%" y="60" font-family="Georgia, serif" font-size="46" font-weight="700" fill="#1F1F1F" text-anchor="middle">Regalos que se abren</text><text x="50%" y="108" font-family="Arial, sans-serif" font-size="26" fill="#1F1F1F" text-anchor="middle">Madera MDF grabada · Ambato</text></svg>`);
  await sharp({ create: { width: W, height: H, channels: 3, background: '#D66A2B' } })
    .composite([{ input: svg, left: 0, top: 0 }, { input: ad, left: W - adMeta.width, top: 0 }, { input: logo, left: Math.round((W - adMeta.width - 440) / 2), top: 150 }, { input: text, left: 48, top: 330 }])
    .jpeg({ quality: 82 }).toFile(path.join(outDir, 'og-1200x630.jpg'));
}
function fbFile(hash) { return JSON.parse(fs.readFileSync(path.join(ROOT, 'data/fb-images.json'), 'utf8')).find(e => e.id === 'fb-' + hash).file; }

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const t = Date.now(); const m = await buildImages(SRC, OUT, { force: process.argv.includes('--force') });
  console.log(`imágenes: ${Object.keys(m).length} ids en ${((Date.now() - t) / 1000).toFixed(1)}s`);
}
