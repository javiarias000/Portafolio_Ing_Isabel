# Despliegue en EasyPanel

Sitio estático (nginx) construido con Docker. No hay base de datos ni secretos en producción.

## Qué contiene la imagen

- **Etapa build** (`node:20-alpine`): `npm ci` + `npm run build` (genera `public/assets/img` a partir de `assets/src/fb`, `data/posts.json` y `scripts/`).
- **Etapa final** (`nginx:1.27-alpine`): solo `public/`, `nginx.conf` y `nginx-security.conf`. Puerto **80**.
- `.dockerignore` **no** excluye `assets/src/`, `data/` ni `scripts/` (~16 MB) porque el build de imágenes los necesita; solo viven en la etapa build y no llegan a la imagen final. Sí excluye `.git`, `docs`, `portafolio`, `node_modules` y `public/assets/img` (se regenera).
- `/healthz` responde `ok`; `/assets/` con cache de 1 año `immutable`; HTML con `no-cache`; CSP solo `'self'` + `connect.facebook.net` (script) y `www.facebook.com` (connect).
- Importante: como `/assets/` es `immutable`, los archivos generados deben llevar hash en el nombre (o cambiar de nombre cuando cambian). Si no, los visitantes verían imágenes viejas hasta 1 año.

## Pasos en EasyPanel

1. Haz `push` de la rama `main` a `javiarias000/Portafolio_Ing_Isabel` (lo hace una persona; confirmar antes).
2. Proyecto -> **+ Service -> App**. Nombre p. ej. `midea-web`.
3. **Source -> Github**: repo `javiarias000/Portafolio_Ing_Isabel`, rama `main`, Build Path `/`.
4. **Build -> Dockerfile**, archivo `Dockerfile` (raíz).
5. **Build args** (opcionales, no son secretos): `SITE_URL` (p. ej. `https://midea.ejemplo.com`) y `META_PIXEL_ID` (solo si el cliente lo aporta). Dejar en blanco si no aplican; el Dockerfile tiene valores por defecto vacíos.
6. **Domains**: añade el dominio (destino HTTP, puerto **80**) y activa HTTPS (Let's Encrypt). Sin dominio propio, usa el `*.easypanel.host` que crea EasyPanel. Con dominio propio: registro DNS **A** hacia la IP del VPS.
7. Healthcheck (si el panel lo ofrece): ruta `/healthz`.
8. **Deploy** y revisa Deployments / logs.
9. Activa **Auto Deploy** (webhook de GitHub) para que cada push a `main` redespliegue.

No agregues `META_ACCESS_TOKEN` en EasyPanel: el deploy usa la instantánea ya commiteada (`data/posts.json` + `assets/src/fb/`).

## Checklist de verificación en producción

Reemplaza `$URL` por el dominio.

- [ ] Build verde en Deployments; contenedor en estado running.
- [ ] `curl -fsS $URL/healthz` -> `ok`
- [ ] `curl -sI $URL/` -> `200`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy`, `Cache-Control: no-cache`
- [ ] `curl -sI -H 'Accept-Encoding: gzip' $URL/` -> `Content-Encoding: gzip`
- [ ] `curl -sI $URL/assets/...` (una imagen real) -> `Cache-Control: public, max-age=31536000, immutable`
- [ ] `$URL/nope` -> 404 con la página de marca
- [ ] HTTPS válido y `http://` redirige a `https://`
- [ ] Consola del navegador sin errores de CSP
- [ ] El botón de WhatsApp abre el chat con el mensaje precargado
- [ ] Lighthouse móvil >= 90 (rendimiento, accesibilidad, SEO, buenas prácticas)
- [ ] `robots.txt`, `sitemap.xml` y vista previa OG correctas

Rollback: en EasyPanel, Deployments -> redeploy de la versión anterior (o `git revert` y push).

## Refrescar las publicaciones de Facebook

Hecho en local, nunca en EasyPanel:

```bash
META_ACCESS_TOKEN=<token> npm run fb:refresh
git add assets/src/fb data/posts.json
git commit -m "chore: actualiza publicaciones de Facebook"
git push   # dispara el auto-deploy
```

El token solo va en la variable de entorno del comando (no en archivos, `.env` versionado, ni EasyPanel). `.env` está en `.gitignore`.

## Regenerar el token expuesto

El token anterior se pegó en un chat: debe considerarse comprometido.

1. Meta for Developers -> tu app -> **Herramientas -> Explorador de la API Graph** (o Business Settings -> Usuarios del sistema).
2. Revoca/invalida el token anterior (cambiar contraseña de la cuenta o "Cerrar sesión de todos los dispositivos" invalida los tokens de usuario; en Usuarios del sistema, revoca el token).
3. Genera uno nuevo con los permisos mínimos de lectura de la página (`pages_read_engagement`, `pages_show_list`).
4. Úsalo solo como `META_ACCESS_TOKEN=...` en tu terminal.
5. Comprueba que no quedó en el repo: `git grep -n "EAA[o]"` no debe devolver nada (los tokens de Meta empiezan por `EAA`).
