import { fechaCorta } from './wa.js';
const plural = (n, one, many) => new Intl.PluralRules('es').select(n) === 'one' ? one : many;
const BATCH = 12, AUTO_BATCHES = 3;

function picture(img, alt, eager) {
  const set = f => img.widths.map(w => `/assets/img/${img.id}-${w}.${f} ${w}w`).join(', ');
  const sizes = '(min-width: 1100px) 22vw, (min-width: 700px) 30vw, 46vw';
  const p = document.createElement('picture');
  for (const [type, f] of [['image/avif', 'avif'], ['image/webp', 'webp']]) { const s = document.createElement('source'); s.type = type; s.srcset = set(f); s.sizes = sizes; p.append(s); }
  const i = document.createElement('img');
  i.src = `/assets/img/${img.id}-${img.widths.at(-1)}.jpg`; i.srcset = set('jpg'); i.sizes = sizes; i.alt = alt;
  i.width = img.width; i.height = img.height; i.decoding = 'async'; if (!eager) i.loading = 'lazy';
  i.addEventListener('error', () => { const box = p.parentElement; p.remove(); if (box) { box.classList.add('card__img--broken'); box.textContent = 'Imagen no disponible'; } }, { once: true });
  p.append(i); return p;
}

export function cardEl(e, eager = false) {
  const li = document.createElement('li');
  li.className = 'card' + (e.images.length ? '' : ' card--text');
  const first = e.message.trim().split('\n').find(Boolean) || '';
  const alt = first ? `Publicación del ${fechaCorta(e.latest)}: ${first.slice(0, 100)}` : `Publicación de Midea del ${fechaCorta(e.latest)}`;
  if (e.images.length) { const f = document.createElement('div'); f.className = 'card__img'; f.append(picture(e.images[0], alt, eager)); li.append(f); }
  const b = document.createElement('div'); b.className = 'card__body';
  const d = document.createElement('p'); d.className = 'card__date';
  d.textContent = e.count > 1 ? `Publicada ${e.count} veces. Última: ${fechaCorta(e.latest)}` : fechaCorta(e.latest);
  b.append(d);
  const msg = e.message.trim();
  if (msg) { const m = document.createElement('p'); m.className = 'card__msg'; m.textContent = msg; b.append(m); }
  else if (!e.images.length) { const m = document.createElement('p'); m.className = 'card__msg'; m.textContent = 'Publicación sin texto ni imagen.'; b.append(m); }
  if (e.count > 1) {
    const det = document.createElement('details'); det.className = 'card__multi';
    const s = document.createElement('summary'); s.textContent = 'Ver todas las fechas'; det.append(s);
    const ul = document.createElement('ul');
    for (const dt of e.dates) { const x = document.createElement('li'); x.textContent = fechaCorta(dt) + ' ' + new Date(dt.replace(/([+-]\d\d)(\d\d)$/, '$1:$2')).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Guayaquil' }); ul.append(x); }
    det.append(ul); b.append(det);
  }
  li.append(b);
  const a = document.createElement('a'); a.className = 'card__link'; a.href = e.permalink; a.target = '_blank'; a.rel = 'noopener';
  a.textContent = 'Ver en Facebook'; a.setAttribute('aria-label', `Ver en Facebook la publicación del ${fechaCorta(e.latest)}`);
  li.append(a); return li;
}

export async function initTimeline() {
  const grid = document.getElementById('log-grid'); if (!grid) return;
  const more = document.getElementById('log-more'), status = document.getElementById('log-status'), sentinel = document.getElementById('log-sentinel');
  let data;
  try { const r = await fetch('/data/timeline.json'); if (!r.ok) throw new Error(r.status); data = await r.json(); }
  catch { status.textContent = 'No pudimos cargar la bitácora. Mira las publicaciones en nuestra página de Facebook.'; return; }
  const entries = data.entries; let shown = 0, batches = 0;
  const update = () => {
    const left = entries.length - shown;
    status.textContent = left > 0 ? `Mostrando ${shown} de ${entries.length} ${plural(entries.length, 'tarjeta', 'tarjetas')} (${data.total} ${plural(data.total, 'publicación', 'publicaciones')}).` : entries.length ? `Listo: ${entries.length} ${plural(entries.length, 'tarjeta', 'tarjetas')}, ${data.total} ${plural(data.total, 'publicación', 'publicaciones')} en total.` : 'Aún no hay publicaciones para mostrar.';
    more.hidden = left <= 0 || batches < AUTO_BATCHES;
    if (left > 0) more.textContent = `Ver más publicaciones (${left} restantes)`;
  };
  const load = () => {
    const frag = document.createDocumentFragment();
    for (const e of entries.slice(shown, shown + BATCH)) frag.append(cardEl(e, false));
    shown = Math.min(entries.length, shown + BATCH); batches++; grid.append(frag); update();
  };
  more.addEventListener('click', load);
  load();
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => {
      if (batches >= AUTO_BATCHES || shown >= entries.length) { io.disconnect(); return; }
      if (es[es.length - 1].isIntersecting) { load(); io.unobserve(sentinel); io.observe(sentinel); }
    }, { rootMargin: '600px 0px' });
    io.observe(sentinel);
  } else { batches = AUTO_BATCHES; update(); }
}
