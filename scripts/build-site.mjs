// site/index.html -> public/index.html (macros {{pic}}, SITE_URL) + robots.txt + sitemap.xml + data/timeline.json
// Uso: SITE_URL=https://midea.example node scripts/build-site.mjs   (SITE_URL opcional)
import fs from 'node:fs'; import * as esbuild from 'esbuild'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function picture(m, id, alt, sizes, cls = '', mode = '') {
  const e = m[id]; if (!e) throw new Error('imagen sin manifest: ' + id);
  const set = fmt => e.widths.map(w => `/assets/img/${id}-${w}.${fmt} ${w}w`).join(', ');
  const big = e.widths.at(-1);
  const attrs = mode === 'priority' ? 'fetchpriority="high" decoding="async"' : mode === 'eager' ? 'decoding="async"' : 'loading="lazy" decoding="async"';
  const sz = sizes.replace(/^\d+px$/, '$&');
  return `<picture><source type="image/avif" srcset="${set('avif')}" sizes="${esc(sz)}"><source type="image/webp" srcset="${set('webp')}" sizes="${esc(sz)}"><img${cls ? ` class="${cls}"` : ''} src="/assets/img/${id}-${big}.jpg" srcset="${set('jpg')}" sizes="${esc(sz)}" alt="${esc(alt)}" width="${e.width}" height="${e.height}" ${attrs}></picture>`;
}

export function render(tpl, manifest, siteUrl = '', assets = { css: '/assets/css/site.css', js: '/assets/js/main.js', flag: '/assets/js/flag.js' }) {
  let html = tpl.replace(/%%CSS%%/g, assets.css).replace(/%%JS%%/g, assets.js).replace(/%%FLAG%%/g, assets.flag).replace(/\{\{pic ([^|}]+)\|([^|}]*)\|([^|}]*)\|([^|}]*)(?:\|([^}]*))?\}\}/g, (_, id, alt, sizes, cls, mode) => picture(manifest, id.trim(), alt, sizes, cls, (mode || '').trim()));
  html = siteUrl ? html.replace(/<!--\/?site-url-->/g, '') : html.replace(/<!--site-url-->[\s\S]*?<!--\/site-url-->/g, '');
  html = html.replaceAll('%%SITE_URL%%', siteUrl);
  if (!siteUrl) html = html.replace(/"image":"\/assets\/img\/og-1200x630.jpg",?\s*/, '').replace(/,"url":"\/"/, '');
  return html;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const siteUrl = (process.env.SITE_URL || '').replace(/\/+$/, '');
  const pub = path.join(ROOT, 'public');
  const manifest = JSON.parse(fs.readFileSync(path.join(pub, 'assets/img/manifest.json'), 'utf8'));
  // CSS/JS empaquetados con hash en el nombre (cache inmutable seguro)
  for (const d of ['css', 'js']) { const dir = path.join(pub, 'assets', d); fs.mkdirSync(dir, { recursive: true }); for (const f of fs.readdirSync(dir)) fs.rmSync(path.join(dir, f)); }
  const common = { bundle: true, minify: true, entryNames: '[name].[hash]', metafile: true, logLevel: 'error', target: 'es2020' };
  const rel = r => '/' + path.relative(pub, Object.keys(r.metafile.outputs)[0]).split(path.sep).join('/');
  const cssR = await esbuild.build({ ...common, entryPoints: [path.join(ROOT, 'site/css/site.css')], outdir: path.join(pub, 'assets/css'), external: ['*.woff2'] });
  const jsR = await esbuild.build({ ...common, entryPoints: [path.join(ROOT, 'site/js/main.js')], outdir: path.join(pub, 'assets/js'), format: 'esm' });
  const flagR = await esbuild.build({ ...common, entryPoints: [path.join(ROOT, 'site/js/flag.js')], outdir: path.join(pub, 'assets/js'), format: 'iife' });
  const html = render(fs.readFileSync(path.join(ROOT, 'site/index.html'), 'utf8'), manifest, siteUrl, { css: rel(cssR), js: rel(jsR), flag: rel(flagR) });
  fs.writeFileSync(path.join(pub, 'index.html'), html);
  fs.mkdirSync(path.join(pub, 'data'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'data/timeline.json'), path.join(pub, 'data/timeline.json'));
  fs.writeFileSync(path.join(pub, 'robots.txt'), `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ''}`);
  const sm = path.join(pub, 'sitemap.xml');
  if (siteUrl) fs.writeFileSync(sm, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url></urlset>\n`);
  else if (fs.existsSync(sm)) fs.rmSync(sm);
  console.log(`site: public/index.html (${(html.length / 1024).toFixed(0)} KB)${siteUrl ? ' SITE_URL=' + siteUrl : ' sin SITE_URL (canonical/sitemap omitidos)'}`);
}
