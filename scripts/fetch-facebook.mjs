// Descarga publicaciones e imágenes de la página de Facebook a assets/src/fb/ y data/posts.json.
// Uso: META_ACCESS_TOKEN=... node scripts/fetch-facebook.mjs   (el token NUNCA se guarda)
import fs from 'node:fs'; import path from 'node:path';
const T = process.env.META_ACCESS_TOKEN, P = process.env.META_PAGE_ID || '1130355880150943';
if (!T) { console.error('Falta META_ACCESS_TOKEN'); process.exit(1); }
const G = 'https://graph.facebook.com/v21.0';
const j = async (u, t) => { const r = await (await fetch(u.startsWith('http') ? u : G + u, { headers: { Authorization: 'Bearer ' + t } })).json(); if (r.error) throw new Error(JSON.stringify(r.error)); return r; };
const pt = (await j(`/${P}?fields=access_token`, T)).access_token || T;
const page = await j(`/${P}?fields=id,name,category,phone,single_line_address,link,about,description,fan_count`, pt);
const fields = 'id,created_time,message,permalink_url,status_type,full_picture,attachments{type,media_type,url,media{image{src,width,height}},subattachments{media{image{src,width,height}}}}';
let url = `/${P}/posts?limit=50&fields=${encodeURIComponent(fields)}`, raw = [];
while (url) { const r = await j(url, pt); raw.push(...r.data); url = r.paging?.next; }
fs.mkdirSync('assets/src/fb', { recursive: true });
const dl = async (src, file) => { const b = Buffer.from(await (await fetch(src)).arrayBuffer()); fs.writeFileSync(file, b); };
const posts = [];
for (const p of raw.sort((a, b) => new Date(b.created_time) - new Date(a.created_time))) {
  const id = p.id.split('_')[1]; const att = p.attachments?.data?.[0];
  const srcs = att?.subattachments?.data?.map(s => s.media?.image?.src).filter(Boolean) || [att?.media?.image?.src || p.full_picture].filter(Boolean);
  const images = [];
  for (const [i, s] of srcs.entries()) { const f = `assets/src/fb/${id}-${i}.jpg`; try { await dl(s, f); images.push(path.basename(f)); } catch (e) { console.warn('img fail', id, e.message); } }
  posts.push({ id, date: p.created_time, message: p.message || '', permalink: p.permalink_url, type: p.status_type, images });
}
fs.mkdirSync('data', { recursive: true });
fs.writeFileSync('data/posts.json', JSON.stringify({ fetchedAt: new Date().toISOString(), page, posts }, null, 1));
console.log(`posts: ${posts.length}, con imagen: ${posts.filter(p => p.images.length).length}`);
