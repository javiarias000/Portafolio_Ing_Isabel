# Midea Diseño Creativo — sitio web

Landing de una página para **Midea Diseño Creativo** (Ambato, Ecuador): regalos personalizados en MDF y madera grabada, con la bitácora de publicaciones de la página de Facebook "Mi Idea" y el portafolio de la Ing. María Isabel Villena.

**En producción:** https://javlabs-mideaweb.12t4ag.easypanel.host/

## Cómo funciona

- Sitio estático. La plantilla está en `site/` y el build genera `public/` (HTML, CSS/JS con hash en el nombre, imágenes AVIF/WebP/JPG responsivas).
- Las publicaciones de Facebook se guardan como instantánea en `data/posts.json` e imágenes en `assets/src/fb/`. Las URLs de Meta caducan, por eso no se leen en vivo.
- `data/timeline.json` se genera de esa instantánea: excluye posts de prueba y agrupa los repetidos (236 publicaciones → 118 tarjetas).
- Los pedidos salen por WhatsApp (`+593 987738663`) con el mensaje ya escrito.

## Comandos

```bash
npm ci
npm run build        # timeline + imágenes + sitio -> public/
npm test             # 17 pruebas
npm run serve        # http://localhost:8080
npm run e2e | a11y | break-ui | lighthouse   # verificaciones (necesitan Chrome)
```

## Actualizar las publicaciones de Facebook

```bash
META_ACCESS_TOKEN=<token> npm run fb:refresh
git add data assets/src/fb && git commit -m "chore: actualizar publicaciones" && git push
```

El token **nunca** se guarda en el repo ni en EasyPanel.

## Despliegue

Dockerfile multi-stage (Node build → nginx, puerto 80, `/healthz`). Pasos de EasyPanel y verificación en `docs/DEPLOY-EASYPANEL.md`. Cada push a `main` puede redeplegar.

## Pendiente

Ver `docs/BACKLOG.md` (sección de servicios digitales, Pixel de Meta, fotos reales de producto) y `docs/superpowers/` (spec y plan del rediseño).
