# Rediseño Midea Diseño Creativo — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sitio estático de una página para Midea Diseño Creativo (regalos MDF personalizados + portafolio de Isabel), optimizado y desplegado en EasyPanel antes del 14 nov 2026.

**Architecture:** Sitio estático (HTML/CSS/JS vanilla) con script Node de optimización de imágenes; imagen Docker multi-stage nginx; EasyPanel construye desde GitHub `main`.

**Tech Stack:** HTML5, CSS (variables, container queries), JS ES modules mínimo, Node 20 + `sharp` (build de imágenes), nginx:alpine, Docker, EasyPanel.

**Spec:** `docs/superpowers/specs/2026-11-11-rediseno-midea-design.md`

## Global Constraints

- Idioma: español (Ecuador). Teléfono WhatsApp: `+593987738663` → enlace `https://wa.me/593987738663`.
- Marca: naranja `#D66A2B`, ámbar `#F19A3E`, óxido `#B4532A`, tinta `#1F1F1F`, fondo kraft `#F4E9D8`.
- Nombre público: "Midea Diseño Creativo"; titular legal en pie: "Villena Cárdenas María Isabel", © 2026.
- Sin secretos en el repo (token de Meta NO se guarda). Sin dependencias de runtime en CDN; fuentes autoalojadas.
- Metas: Lighthouse móvil ≥ 90 en las 4 categorías; primera carga < 1.2 MB; WCAG 2.1 AA.
- Precio, medidas, envío y fecha límite son datos pendientes: mostrar "Consulta por WhatsApp", nunca inventar.
- Sin git operations remotas (push) sin confirmación del usuario.

## Review Focus

- Imagen faltante/rota → la tarjeta conserva dimensiones y alt (sin salto de layout).
- Nombre/descripción muy largos o sin tilde en tarjetas → no desbordan (`break-ui`).
- JS deshabilitado → sitio legible, CTA WhatsApp funciona (enlace nativo).
- `prefers-reduced-motion` → sin animaciones de entrada.
- Móvil 320 px y 4K → sin scroll horizontal, tipografía fluida.
- Ruta inexistente en producción → 404 propio, no página de nginx.

---

### Task 1: Auditoría y limpieza de assets

**Files:**
- Create: `scripts/audit-assets.mjs`, `assets/src/` (originales renombrados)
- Modify: mover `portafolio/*` → `assets/src/`
- Test: `scripts/audit-assets.test.mjs`

**Interfaces:**
- Produces: `assets/src/<slug>.{jpg,png}` sin duplicados (hash SHA-1 único); `assets/src/manifest.json` = `[{id, file, title, category, alt, width, height}]`.

- [ ] **Step 1:** Test `no hay archivos duplicados por hash` y `todos los nombres coinciden /^[a-z0-9-]+\.(jpg|png)$/`.
- [ ] **Step 2:** Run `node --test scripts/` → FAIL.
- [ ] **Step 3:** Renombrar (`aula.jpg` y `aula teórica…` son idénticos → conservar uno; `Bathroom.png` = captura 2017-01-24 → conservar uno) y generar `manifest.json` con `alt` descriptivo real (viendo cada imagen).
- [ ] **Step 4:** Run `node --test scripts/` → PASS.
- [ ] **Step 5:** Commit `chore: limpiar y renombrar assets`.

### Task 2: Pipeline de imágenes

**Files:** Create `scripts/build-images.mjs`, `package.json` (devDependency `sharp@0.33`); output `public/assets/img/` (git-ignored).

**Interfaces:**
- Consumes: `assets/src/manifest.json`.
- Produces: `public/assets/img/<id>-{480,960,1600}.{avif,webp,jpg}`; `public/assets/img/manifest.json` con `srcset` por id; `og-1200x630.jpg`.

- [ ] **Step 1:** Test: para cada id existen 3 anchos × 3 formatos y la suma de `hero-960.avif` < 120 KB.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implementar `buildImages(srcDir, outDir): Promise<void>` con sharp (calidad avif 50, webp 75, jpg 80). **Step 4:** Run → PASS. **Step 5:** Commit `feat: pipeline de imágenes`.

### Task 3: Dirección de arte (design-taste-frontend + frontend-design)

**Files:** Create `docs/design/DESIGN.md`, `docs/design/direction.md`.

- [ ] **Step 1:** Invocar `design-taste-frontend`; barajar direcciones con `draw.mjs`; elegir la que sostiene "taller de zorro/madera láser"; registrar tokens (color, tipografía, espaciado, radios, sombras) en `DESIGN.md`.
- [ ] **Step 2:** Invocar `impeccable` `document` para validar contra `PRODUCT.md`/`DESIGN.md`. Crear `PRODUCT.md` (público: familias y empresas de Ambato; tono cálido, artesanal, devoto sin cursilería).
- [ ] **Step 3:** Revisión del usuario de la dirección (maqueta del hero). Commit `docs: dirección de arte`.

### Task 4: Base HTML/CSS (tokens, layout, tipografía)

**Files:** Create `public/index.html`, `public/assets/css/{tokens,base,layout,components}.css`, `public/assets/fonts/*.woff2`; Remove `styles.css`, `index.html` raíz tras migrar.

**Interfaces:** Consumes tokens de Task 3. Produces clases: `.hero`, `.section`, `.card`, `.btn`, `.btn--wa`, `.steps`, `.contact` (usadas por Tasks 5–6).

- [ ] **Step 1:** Test Playwright `home carga sin errores de consola y sin scroll horizontal a 320/768/1440 px`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implementar estructura semántica (`header/nav/main/section/footer`), tokens en `:root` + `prefers-color-scheme` no requerido (tema claro único), fuentes `font-display: swap` con preload del woff2 de titulares.
- [ ] **Step 4:** Run → PASS. **Step 5:** Commit `feat: base del sitio`.

### Task 5: Secciones de contenido

**Files:** Modify `public/index.html`; Create `public/assets/js/main.js`.

**Interfaces:**
- Produces: `waLink(message: string): string` → `https://wa.me/593987738663?text=<encoded>`; `data-wa="<mensaje>"` en cada CTA, resuelto por `main.js`, con `href` estático de respaldo sin JS.

- [ ] **Step 1:** Tests: `waLink("Hola, quiero un nacimiento")` devuelve URL con `%20` correctos; todo `a[data-wa]` tiene `href` válido sin JS; el pie dice "© 2026".
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implementar secciones del spec §4 (Hero, Navidad 2026, Catálogo, Cómo pedir, Portafolio Isabel 6–8 piezas con lightbox `<dialog>`, Contacto, Pie). Copy con `design:ux-copy`; sin `**` markdown; corregir "secunciación", "Publos", "lámpara".
- [ ] **Step 4:** Run → PASS. **Step 5:** Commit `feat: secciones y CTA WhatsApp`.

### Task 6: Movimiento y móvil

**Files:** Modify `components.css`, `main.js`.

- [ ] **Step 1:** Invocar `animate`: definir entradas escalonadas (`opacity`+`translateY(8px)`, 220 ms, `cubic-bezier(.2,.7,.2,1)`) y hover de la "cajita" del hero.
- [ ] **Step 2:** Invocar `mobile-native`: `100dvh`, `touch-action`, `-webkit-tap-highlight-color`, `font-size ≥16px` en inputs, safe-area.
- [ ] **Step 3:** Test: con `reducedMotion: 'reduce'` ninguna transición/animación > 0 ms. Run → PASS.
- [ ] **Step 4:** Invocar `animation-performance` y `review-animations`; corregir hallazgos. Commit `feat: movimiento`.

### Task 7: SEO, OG, analítica

**Files:** Modify `index.html`; Create `public/{robots.txt,sitemap.xml,favicon.svg,site.webmanifest}`.

- [ ] **Step 1:** Test: existen `meta[name=description]`, `link[rel=canonical]`, `og:image`, JSON-LD `LocalBusiness` válido con `telephone: "+593987738663"` y `addressLocality: "Ambato"`.
- [ ] **Step 2:** Implementar; `canonical`/`sitemap` leen `SITE_URL` en build (`ARG`). Evento `click_whatsapp` vía `fbq('trackCustom','ClickWhatsApp')` solo si `META_PIXEL_ID` definido.
- [ ] **Step 3:** Invocar `marketing:seo-audit` y `marketing:brand-review`; corregir. Commit `feat: SEO y medición`.

### Task 7b: Rigor de calidad

- [ ] **Step 1:** `impeccable` `critique` + `audit` → lista priorizada; aplicar `polish`/`harden`.
- [ ] **Step 2:** `break-ui` (nombres largos, imagen rota, 0 y 50 productos); `design:accessibility-review`.
- [ ] **Step 3:** Lighthouse móvil: `npx lighthouse http://localhost:8080 --preset=perf --form-factor=mobile` → todas ≥ 90. Commit `fix: hallazgos de calidad`.

### Task 8: Contenedor y servidor

**Files:** Create `Dockerfile`, `nginx.conf`, `.dockerignore`, `public/404.html`, `public/healthz` (texto `ok`).

**Interfaces:** Produces imagen que escucha en **:80**, `GET /healthz` → 200 `ok`.

- [ ] **Step 1:** Test de humo (`scripts/smoke.sh`): `docker build -t midea .`, `docker run -d -p 8080:80`, `curl -fsS /healthz` = `ok`, `curl -I /` incluye `X-Content-Type-Options: nosniff` y `Cache-Control`, `/nope` → 404 con `404.html`, `curl -H 'Accept-Encoding: gzip' -I /` → `Content-Encoding: gzip`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Dockerfile: `FROM node:20-alpine AS build` (`npm ci && node scripts/build-images.mjs`) → `FROM nginx:1.27-alpine` copiando `public/` y `nginx.conf`. nginx: gzip on, `/assets/` `expires 1y; immutable`, HTML `no-cache`, CSP `default-src 'self'; img-src 'self' data:; script-src 'self' https://connect.facebook.net; connect-src 'self' https://www.facebook.com`.
- [ ] **Step 4:** Run → PASS. **Step 5:** Commit `feat: contenedor nginx`.

### Task 9: Despliegue en EasyPanel

**Files:** Create `docs/DEPLOY-EASYPANEL.md`.

Pasos en EasyPanel (UI), los hace el usuario o el agente con acceso:
- [ ] **Step 1:** Subir cambios a `main` en `javiarias000/Portafolio_Ing_Isabel` (**requiere confirmación del usuario para el push**).
- [ ] **Step 2:** En EasyPanel: proyecto → **+ Service → App** → Source **GitHub** repo/rama `main` → Build **Dockerfile** (ruta `Dockerfile`) → Proxy/puerto **80**.
- [ ] **Step 3:** Environment: `SITE_URL` (y `META_PIXEL_ID` opcional) como *Build args*.
- [ ] **Step 4:** Domains: añadir dominio (o el `*.easypanel.host` temporal), activar HTTPS; apuntar DNS A al IP del VPS si hay dominio propio.
- [ ] **Step 5:** **Deploy**; activar *Auto Deploy*/webhook.
- [ ] **Step 6:** Verificar en producción: `curl -I https://<dominio>/` = 200, `/healthz` = ok, Lighthouse móvil ≥ 90, enlace WhatsApp abre el chat con el mensaje.
- [ ] **Step 7:** Pasar la URL final a la campaña (crear anuncio E en `NAV26 | Tráfico Web`) y a la página de Facebook (sitio web + about + botón "Enviar mensaje de WhatsApp"). *Acciones sobre Meta requieren confirmación explícita.*
- [ ] **Step 8:** Invocar `engineering:deploy-checklist` y `superpowers:verification-before-completion`. Commit `docs: guía de despliegue`.

### Task 10: Cierre de seguridad y marca

- [ ] **Step 1:** Regenerar el token de Meta (el actual se pegó en el chat); confirmar que `git grep -n "EAA[o]"` no devuelve nada.
- [ ] **Step 2:** Actualizar `../README.md` de la campaña con la URL del sitio.

## Cronograma sugerido (hasta el 14 nov)

| Día | Tareas |
|---|---|
| 11 nov | 1, 2, 3 (aprobar dirección) |
| 12 nov | 4, 5, 6 |
| 13 nov | 7, 7b, 8 |
| 14 nov | 9, 10 → activar campaña |

Dependencias: 1→2→4→5; 3→4; 8 requiere 2 y 7; 9 requiere 8.
