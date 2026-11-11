# Spec — Rediseño del sitio Midea Diseño Creativo ("Mi Idea")

Fecha: 2026-11-11 · Repo: `javiarias000/Portafolio_Ing_Isabel` · Estado: borrador para revisión

## 1. Hallazgos (fuentes)

### Página de Facebook "Mi Idea" (Graph API, id `1130355880150943`)
- Categoría "Diseño y moda", Ambato (180101), tel. +593 987738663, **3 seguidores**, sin sitio web, sin descripción/about, sin email, sin username.
- Portada = logo horizontal "midea DISEÑO CREATIVO" sobre fondo blanco; avatar = zorro geométrico naranja + wordmark.
- Contenido publicado (mayo 2026, 1 post diario): retratos grabados en madera ($10 → $8, 15×15 cm), "Arte en Madera", **servicios web/SEO** ("Web Moderna y Rápida"), publicidad ("Publicidad que funciona"), "Alcance Global, Servicio Local". Mezcla de tres ofertas sin hilo común.
- Campaña activa en pausa (ver `../README.md`): **Navidad 2026, mini nacimientos en MDF en cajitas sorpresa**, CTA WhatsApp; **falta la URL web** (anuncio E de tráfico, 14 nov – 23 dic).
- Token: el de usuario da acceso a la página y permisos ads/posts. Insights devolvió vacío (página con poca actividad). **El token se pegó en el chat → regenerar tras el trabajo.** No se guarda en ningún archivo.
- Páginas hermanas en la misma cuenta (Golden Strings, ServiGypsum, Javlabs, ACtecnofix) quedan fuera de alcance.

### Repo `Portafolio_Ing_Isabel` (sitio actual)
Estático: `index.html` (inline JS), `styles.css`, `portafolio/` (14 imágenes, ~3.3 MB, PNG pesados). Problemas verificados al leer el código:
1. **Identidad confusa**: es el portafolio académico de la Ing. Isabel (tesis, ergonomía, skills con barras %) pero el título es "Mi Idea" y el negocio vende regalos MDF. No vende nada ni tiene CTA de WhatsApp.
2. **Sin catálogo de lo que se anuncia**: ni nacimientos, ni cajitas, ni grabado láser.
3. **Bugs de contenido**: `**negrita**` markdown literal en el HTML (about/educación); copyright 2025; categorías mal asignadas ("Dibujo de ojo" = tesis+mobiliario; manzanas = mobiliario); textos con errores ("secunciación", "Publos", "lampara").
4. **Patrones "hecho por IA"**: barras de habilidad con % inventados, emojis como iconos, fondo `#0f0f23` azul-violeta ajeno a la marca, Inter genérica.
5. **Peso/rendimiento**: PNG de 0.4–1 MB sin optimizar, duplicados (`aula.jpg` = `aula teórica…jpg`, `Bathroom.png` = captura 2017), nombres con espacios/acentos, sin `width/height` ni `loading=lazy`, probing de imágenes por JS (`data-candidates`), html2pdf desde CDN sin versión fija.
6. Sin SEO/OG, sin favicon adecuado, sin sitemap, sin accesibilidad (contraste, foco, `prefers-reduced-motion`).

### Marca (de logo y arte de campaña)
Naranja quemado `#D66A2B`/ámbar `#F19A3E`/óxido `#B4532A`, tinta `#1F1F1F`, **madera MDF/kraft** (material real del producto), zorro geométrico, wordmark caligráfico manuscrito + "DISEÑO CREATIVO" en mayúsculas finas. El arte navideño usa dorado y rojo profundo.

## 2. Objetivo

Convertir el sitio en **la casa digital de Midea Diseño Creativo**: un sitio de una página que (a) muestra y vende regalos personalizados en MDF/madera grabada, (b) da la URL que falta a la campaña NAV26 antes del **14 nov 2026**, (c) conserva el portafolio de Isabel como prueba de oficio (sección secundaria), (d) se despliega en EasyPanel.

**Éxito**: Lighthouse móvil ≥ 90 (Perf/A11y/SEO/BP); LCP < 2.5 s en 4G; clic a WhatsApp visible sin scroll en móvil; página total < 1.2 MB en primera carga.

## 3. Alcance

Dentro: rediseño visual y de contenido, optimización de imágenes, SEO/OG, WhatsApp CTA, formulario-lite (mensaje WhatsApp pre-rellenado), analítica de clics (Meta Pixel opcional), contenedor Docker + guía EasyPanel, dominio/HTTPS.
Fuera: tienda con carrito/pagos, CMS, backend, servicios web/SEO como oferta (se retiran del sitio hasta que Isabel decida), otras páginas de la cuenta.

## 4. Decisiones de diseño

**Clasificación (design-stack)**: página pública nueva sobre incumbente → dirección de arte lidera (`design-taste-frontend`), rigor con `impeccable`, movimiento con skills emilkowalski, cierre con craft-floor.

- **Concepto**: "taller de zorro" — calidez de madera y corte láser. Fondo kraft claro (`#F4E9D8`) con tinta `#1F1F1F`; naranja `#D66A2B` solo para acción y acentos; dorado/rojo de Navidad únicamente en la sección estacional. Reemplaza el tema oscuro azul.
- **Tipografía**: titulares con una caligráfica/humanista que eco el wordmark (candidatas a validar con `draw.mjs`: Caveat Brush, Fraunces, Gloock); cuerpo humanista legible (p. ej. Instrument Sans / DM Sans). Autoalojadas (woff2), sin Google Fonts en runtime.
- **Estructura** (una página, español, mobile-first):
  1. Hero: arte de campaña real + promesa "Regalos que se abren: fe, tradición y creatividad" + botón **Pedir por WhatsApp** (`wa.me/593987738663?text=…`).
  2. Navidad 2026: nacimientos en cajitas sorpresa (3 beneficios del arte: corporativos, familiares, recuerdo), fecha límite de pedidos 🔸 y precio 🔸 (datos pendientes del cliente).
  3. Catálogo corto: cajitas/nacimientos, retratos grabados en madera (15×15), personalizados con nombre. Tarjetas con foto real; sin precios inventados.
  4. Cómo pedir en 3 pasos (escribe → personalizamos → entrega en Ambato/envío).
  5. Portafolio de diseño (Isabel): 6–8 piezas curadas, filtros eliminados o reducidos, lightbox accesible; texto de perfil corto y corregido. Se eliminan barras de %.
  6. Contacto: WhatsApp, Facebook, mapa/ciudad Ambato, email.
  7. Pie: © 2026 Villena Cárdenas María Isabel.
- **Movimiento** (mínimo, con propósito): entrada escalonada de tarjetas, apertura de caja/“cajita” en hover del hero (CSS), transiciones `transform/opacity` ≤ 250 ms con ease-out, `prefers-reduced-motion` respetado, nada animado en scroll continuo.
- **Contenido**: solo hechos verificados; datos marcados 🔸 se piden al cliente antes de publicar (precio, medidas, envío, fecha límite).

## 5. Requisitos técnicos

- Sigue estático (sin bundler obligatorio). Se admite un script `node` de build para imágenes (sharp) que genera `assets/img/*.{avif,webp,jpg}` con `srcset`; el HTML final se sirve tal cual.
- JS inline mínimo → mover a `assets/js/main.js` (galería/lightbox/enlaces WhatsApp). Sin html2pdf (la descarga PDF se elimina; si se quiere, enlace a PDF estático).
- Imágenes: renombrar a ASCII-kebab, eliminar duplicados, `width/height`, `loading=lazy` salvo hero, `fetchpriority=high` en hero.
- SEO: `<title>`, meta description, canonical, OG/Twitter con imagen 1200×630, JSON-LD `LocalBusiness` (nombre Midea Diseño Creativo, Ambato, tel.), `robots.txt`, `sitemap.xml`, favicon SVG/PNG.
- Accesibilidad: WCAG 2.1 AA (contraste, foco visible, alt reales, targets ≥ 44 px).
- Medición: eventos `click_whatsapp` (Meta Pixel opcional, ID aportado por cliente) y parámetros UTM de la campaña preservados.

## 6. Despliegue (EasyPanel)

- Imagen `nginx:alpine` multi-stage: etapa Node (build de imágenes) → etapa nginx sirviendo `/usr/share/nginx/html`. `nginx.conf` con gzip/brotli-estático, `Cache-Control` largo para `/assets` (hash en nombre), corto para HTML, cabeceras de seguridad (CSP básica, X-Content-Type-Options, Referrer-Policy), `try_files` y 404 propio, `/healthz`.
- Servicio tipo **App** en EasyPanel desde GitHub (`javiarias000/Portafolio_Ing_Isabel`, rama `main`), build por Dockerfile, puerto **80**, healthcheck `/healthz`, dominio + HTTPS (Let's Encrypt) en la pestaña Domains, auto-deploy por webhook.
- Sin variables secretas (sitio estático). Pixel ID, si existe, se inyecta en build vía `ARG`.
- Sigue el patrón de las skills `deploy-easypanel` / `publicar-cambios` ya usadas en ServiGypsum y Belaria.

## 7. Equipo de agentes y skills

| Rol | Agente / skill | Responsabilidad |
|---|---|---|
| Orquestador | sesión principal + `superpowers:subagent-driven-development` | Ejecuta el plan tarea a tarea |
| Dirección de arte | `design-taste-frontend` (+ `frontend-design`) | Concepto, paleta, tipografía, composición del hero y secciones |
| UX/UI rigor | `impeccable` (shape, layout, typeset, colorize, polish, harden) + `design:ux-copy` | Jerarquía, copy en español, estados vacíos/errores |
| Movimiento | `animate`, `animation-performance`, `review-animations`, `mobile-native` | Micro-interacciones, rendimiento, sensación nativa móvil |
| Calidad | `break-ui`, `design:accessibility-review`, `engineering:testing-strategy` | Casos extremos, WCAG, verificación Lighthouse |
| Contenido/SEO | `marketing:seo-audit`, `marketing:brand-review` | Metadatos, JSON-LD, voz de marca |
| DevOps | `deploy-easypanel`, `engineering:deploy-checklist` | Dockerfile, nginx, EasyPanel, dominio |
| Revisión | `agent: Explore` (inventario), `agent: Plan`, `code-review` | Auditoría previa y revisión final |
| Cierre | `superpowers:verification-before-completion` | Evidencia antes de declarar terminado |

## 8. Riesgos y preguntas abiertas

1. **Dominio**: ¿existe uno? Si no, se usa el subdominio de EasyPanel temporalmente (suficiente para la campaña) y se compra uno después. *Pendiente del cliente.*
2. **Datos 🔸**: precio, medidas, envío, fecha límite. Sin ellos la sección Navidad lleva "Consulta por WhatsApp".
3. **Fotos reales** de los nacimientos/retratos: hoy solo existe el arte generado de la campaña; el catálogo necesita fotos de producto.
4. **Identidad**: ¿el sitio se llama "Midea Diseño Creativo" (marca) y Isabel aparece como diseñadora? Se asume que sí.
5. **Servicios web/SEO** en los posts de la página: se asumen fuera del sitio.
6. **WhatsApp vinculado a la página**: confirmar (ya anotado en README de campaña).
7. **Token** expuesto: regenerar.

## 9. Actualización 2026-11-11 (decisiones del cliente)

1. **Datos y fotos salen de la página de Facebook vía Graph API.** `scripts/fetch-facebook.mjs` (token solo por env `META_ACCESS_TOKEN`, nunca en el repo) descarga publicaciones e imágenes a `assets/src/fb/` y `data/posts.json` (instantánea: las URLs de Meta caducan, por eso se descargan). Descripción, categoría, teléfono y dirección de la empresa también vienen de `page` en ese JSON. El campo `about` de la página está vacío → texto de empresa se redacta a partir de los posts reales y se sugiere cargarlo también en Facebook.
2. **Todas las publicaciones van en la landing, ordenadas por fecha (más reciente primero)** como sección "Línea de tiempo / Bitácora". Hallazgo: 237 posts (218 el 20-21 abr, 19 en mayo), **solo 51 imágenes únicas y 67 mensajes únicos** (programación diaria repetida) y un post de prueba ("Test"). Regla: se **excluyen** posts de prueba; los que repiten imagen+mensaje se **agrupan en una sola tarjeta** con "publicada N veces, última: fecha", conservando el listado completo en `data/posts.json` y la fecha de cada aparición en el detalle. Carga por lotes (IntersectionObserver / "ver más"), imágenes responsivas y `loading=lazy`; cada tarjeta enlaza a su `permalink` en Facebook.
3. **Servicios web/SEO/publicidad**: **sección aparte, trabajo posterior** (ver `docs/BACKLOG.md`). Mientras tanto los posts que los mencionan aparecen en la línea de tiempo, pero no hay sección de servicios.
4. **Ejecución con subagentes** (`superpowers:subagent-driven-development`).
5. Refresco: `npm run fb:refresh` re-ejecuta el fetch y el build de imágenes; documentado en `docs/DEPLOY-EASYPANEL.md`. El deploy usa la instantánea commiteada (sin token en EasyPanel).
