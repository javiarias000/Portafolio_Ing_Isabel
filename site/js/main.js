import { waLink } from './wa.js';
import { initTimeline } from './timeline.js';

// Enlaces de WhatsApp: el href estático sirve sin JS; aquí se refuerza y se mide.
document.querySelectorAll('a[data-wa]').forEach(a => { a.href = waLink(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="https://wa.me/"]'); if (!a) return;
  if (window.fbq) window.fbq('trackCustom', 'ClickWhatsApp');
}, { passive: true });

// Entrada escalonada (una vez, solo transform/opacity)
const items = [...document.querySelectorAll('[data-reveal]')];
const show = el => el.classList.add('is-in');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const seen = new Map();
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const sib = en.target.parentElement; const n = seen.get(sib) || 0; seen.set(sib, n + 1);
    en.target.style.setProperty('--d', Math.min(n, 5) * 70 + 'ms');
    show(en.target); io.unobserve(en.target);
  }), { rootMargin: '0px 0px -8% 0px' });
  items.forEach(el => io.observe(el));
} else items.forEach(show);

// Cosa viva: nombre grabado en la cajita
const inp = document.getElementById('engrave-in'), out = document.getElementById('engrave-out'), ewa = document.getElementById('engrave-wa');
if (inp && out) {
  inp.addEventListener('input', () => {
    const v = inp.value.trim().slice(0, 18) || 'Jorge H.';
    out.textContent = v;
    ewa.href = waLink(`Hola Midea, quiero una cajita de Navidad con el nombre: ${v}`);
  });
  inp.form.addEventListener('submit', e => e.preventDefault());
}

// Pedido rápido -> WhatsApp con el mensaje armado
const coupon = document.getElementById('coupon');
coupon?.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(coupon);
  const yo = (f.get('yo') || '').toString().trim(), texto = (f.get('texto') || '').toString().trim();
  const msg = `Hola Midea, ${yo ? 'soy ' + yo + ' y ' : ''}me interesa: ${f.get('que')}.${texto ? ' Texto o nombre para grabar: ' + texto + '.' : ''}`;
  window.open(waLink(msg), '_blank', 'noopener');
  if (window.fbq) window.fbq('trackCustom', 'ClickWhatsApp');
});

// Lightbox accesible (<dialog>)
const lb = document.getElementById('lightbox');
if (lb && typeof lb.showModal === 'function') {
  const img = document.getElementById('lb-img');
  let opener = null;
  document.querySelectorAll('[data-piece]').forEach(btn => btn.addEventListener('click', () => {
    opener = btn;
    const src = btn.querySelector('img');
    img.src = src.currentSrc || src.src; img.alt = src.alt; img.width = src.naturalWidth || src.width; img.height = src.naturalHeight || src.height;
    document.getElementById('lb-title').textContent = btn.dataset.title;
    document.getElementById('lb-text').textContent = btn.dataset.text;
    lb.showModal();
  }));
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  lb.addEventListener('close', () => opener?.focus());
} else document.querySelectorAll('[data-piece]').forEach(b => { b.disabled = true; });

initTimeline();

// Nombre grabado: el laser "quema" el nombre al verlo y tras cada pausa al escribir (no en cada tecla)
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (out && !reduceMotion) {
  const burn = () => { out.classList.remove('is-burn'); void out.offsetWidth; out.classList.add('is-burn'); };
  out.addEventListener('animationend', () => out.classList.remove('is-burn'));
  let t; inp.addEventListener('input', () => { clearTimeout(t); t = setTimeout(burn, 320); });
  if ('IntersectionObserver' in window) {
    const once = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { burn(); once.disconnect(); } }, { threshold: .6 });
    once.observe(out);
  }
}

// Barra inferior de WhatsApp (movil): visible tras el hero, oculta cuando el contacto ya trae su propio boton
const wabar = document.getElementById('wabar'), heroCta = document.getElementById('hero-cta'), contacto = document.getElementById('contacto');
if (wabar && heroCta && 'IntersectionObserver' in window) {
  let heroOut = false, contactIn = false;
  const sync = () => wabar.classList.toggle('is-on', heroOut && !contactIn);
  new IntersectionObserver(es => { const e = es.at(-1); heroOut = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); }).observe(heroCta);
  if (contacto) new IntersectionObserver(es => { contactIn = es.at(-1).isIntersecting; sync(); }, { rootMargin: '0px 0px -35% 0px' }).observe(contacto);
}
