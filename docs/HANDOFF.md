# HANDOFF — dónde continuar

Actualizado: 2026-11-11 (sesión de Claude Code por SSH). Léelo primero si retomas el trabajo.

## Estado actual

| Cosa | Estado |
|---|---|
| Sitio v1 (landing + bitácora de 236 posts de Facebook + portafolio de Isabel) | **En producción**: https://javlabs-mideaweb.12t4ag.easypanel.host/ |
| Código en GitHub (`javiarias000/Portafolio_Ing_Isabel`, `main`) | Subido hasta `41114c9` (README) |
| EasyPanel | Servicio `mideaweb` en proyecto `javlabs` (panel `http://76.13.229.236:3000`): GitHub `main`, Dockerfile en la raíz, puerto 80, dominio `*.easypanel.host`. Se redespliega con el botón **Deploy** |
| **Rediseño "subir de nivel" (UX/UI)** | **TERMINADO y commiteado en local** (`7c198eb`, `08f5c98`), **sin push ni deploy**. Verificado: build, 17/17 pruebas, e2e 11/11, axe 0 violaciones, Lighthouse móvil 96/100/100/100 (LCP simulado 2,8 s). Capturas antes/después en `.tmp/shots/{before,after}` (ignoradas por git) |

## Siguiente paso inmediato

1. **Javier:** `git push origin main` desde su terminal.
2. **Claude (o Javier):** EasyPanel → `javlabs/mideaweb` → **Deploy** y verificar la portada en producción.
3. Revisar en un teléfono real (safe-area, barra fija de WhatsApp, teclado) y que la clienta apruebe el recorte del flyer de la portada.
4. Detalle menor: arriba de la foto de la portada asoma un resto del flyer (curva dorada y una letra cortada); recortar un poco más (`site/css`, recorte del hero).

## (Histórico) Si la sesión se cortó antes de terminar el rediseño

1. `cd` a la carpeta del repo y mira `git status` y `git diff --stat`. Si el sitio compila y las pruebas pasan, commitea; si no, `git stash` o `git checkout -- site/` vuelve a la versión de producción.
2. Verifica: `npm ci && npm run build && npm test` (17 pruebas) y, con `npx serve public -l 8080` en otra terminal, `npm run e2e`, `npm run a11y`, `npm run lighthouse`.
3. Compara capturas: `node scripts/shoot.mjs http://localhost:8080/ .tmp/shots` (320/390/768/1440).
4. Directriz del rediseño: sentir el **material** (kraft, veta de MDF, grabado láser), catálogo con pieza destacada y jerarquía (sin franjas de color arbitrarias ni "Consulta por WhatsApp" ×8), portada con producto como héroe, bordes de papel troquelado entre secciones, barra de WhatsApp fija en móvil, movimiento solo `transform/opacity` ≤420 ms y `prefers-reduced-motion`. Detector de diseño: `impeccable.cmd detect --json <archivos>`.
5. Actualiza `docs/design/DESIGN.md` con los tokens nuevos.

## Cómo publicar un cambio (cuando esté listo y revisado)

1. `git push origin main` — **lo hace Javier desde su terminal**; Claude Code no tiene credenciales de GitHub (`wincredman` falla). En WSL el repo está en `/mnt/c/Users/Javier Arias/Documents/empresas/mi_idea/Portafolio_Ing_Isabel`.
2. EasyPanel → proyecto `javlabs` → `mideaweb` → **Deploy**. El build tarda unos minutos (optimiza ~64 imágenes). Desde Chrome con Claude, las URL directas a veces cargan en blanco: esperar 5–10 s o recargar.
3. Verificar: `curl -s https://javlabs-mideaweb.12t4ag.easypanel.host/healthz` → `ok` y revisar la portada.

## Pendientes (ordenados)

1. **Terminar y revisar el rediseño** (arriba), commit, push, Deploy.
2. **`SITE_URL`**: definir `https://javlabs-mideaweb.12t4ag.easypanel.host` como build arg en EasyPanel y redeplegar, para tener `canonical`, `sitemap.xml` y `og:image` absoluto. Falta comprobar que EasyPanel pase la variable al build (el Dockerfile declara `ARG SITE_URL` vacío por defecto).
3. **Correr `/review-animations`** (solo lo puede ejecutar el usuario).
4. **Confirmar textos con la clienta**: párrafo "Sobre Midea", bio de Isabel (PUCESA, SENESCYT 17-ene-2024) y email `isavillenacardenas@gmail.com` (del sitio anterior).
5. **Fotos reales de producto**: varias fotos del catálogo (de Facebook) son de baja calidad o con marca de agua; el diseño no lo arregla.
6. **Campaña NAV26 (Meta Ads)**: con la URL final, crear el anuncio E en "NAV26 | Tráfico Web" (campaña en pausa, cuenta `act_1991354128121773`; arranque previsto 14 nov). Tocar Meta o activar gasto requiere confirmación explícita. Confirmar que el WhatsApp +593 987738663 está vinculado a la página "Mi Idea".
7. **Regenerar el token de Meta**: se pegó en el chat. No está en ningún archivo (`git grep "EAA[o]"` sin resultados).
8. **LCP** medido en simulación: 2,6 s (meta 2,5 s). Medir de nuevo en producción.
9. **Licencia gratuita de EasyPanel**: máximo 3 proyectos (ya hay 3), por eso el servicio vive en `javlabs`.
10. `docs/BACKLOG.md`: sección "Servicios digitales" (web/SEO/publicidad), "Acerca de" y web en la página de Facebook, Pixel de Meta, fotos de producto.

## Referencias

- Spec y plan originales: `docs/superpowers/specs/2026-11-11-rediseno-midea-design.md`, `docs/superpowers/plans/2026-11-11-rediseno-midea.md`.
- Despliegue: `docs/DEPLOY-EASYPANEL.md`. README del repo: `README.md`.
- Refrescar publicaciones de Facebook: `META_ACCESS_TOKEN=<token> npm run fb:refresh` (token nunca en el repo).
- WhatsApp Business MCP (otro repo): `../../meta-ads/docs/WHATSAPP_BUSINESS_MCP.md`; aún sin conectar.
- Sesión de Claude Code: al retomar, `claude --continue` en la carpeta del proyecto. Para que sobreviva a un SSH cerrado hay que lanzarla dentro de `tmux`.
