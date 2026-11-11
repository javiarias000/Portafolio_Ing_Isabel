# DESIGN — "Taller de zorro" (la página es la etiqueta de regalo)

**Idea**: sobre esta página, la etiqueta kraft que Midea cuelga de cada regalo se vuelve la tarjeta del hero y la pieza de papelería de cada sección (hueco de cordel, bordes recortados, recibo con borde en zigzag). Cosa viva: el cliente escribe un nombre y lo ve grabado en la cajita de Navidad.

**Dirección** (design-taste-frontend): `page-is-the-object`, hero "Invitation card, cropped" adaptado a etiqueta; galería "Photo tiles with label strips"; cómo pedir "Itinerary on a slip"; contacto "Clip-out coupon". Redibujos: tipografía y paleta (la marca las fija: `--keep palette`; tipo = Fraunces + Instrument Sans autoalojadas, candidatas del spec). La paleta kraft+naranja es la marca del cliente: el brief gana sobre el aviso de "paleta de asistente".

## Tokens
| Token | Valor | Uso |
|---|---|---|
| --orange | #D66A2B | campo del hero, botones secundarios; texto de tinta encima (5:1) |
| --amber | #F19A3E | solo detalle del zorro |
| --oxide | #9E4620 | texto de acento sobre kraft (5:1), tiras |
| --ink | #1F1F1F | texto, botón principal |
| --kraft | #F4E9D8 | fondo de página y papel |
| --kraft-2 | #E8D7BA | paso de tono entre superficies |
| --noel / --gold | #6E1A1A / #E3B65B | solo sección Navidad |
Tipografía: Fraunces 700 (titulares, tracking -0.02em, leading 1), Instrument Sans 400/600 (cuerpo 17–19px, leading 1.5). Pasos: small 14, body 17, lead 22–26, head 32–64, display hasta 6rem.
Forma: esquinas rectas, botón rectangular; sin sombras en reposo, sin degradados, sin líneas finas (separación por tono).
Movimiento: transform/opacity, ≤ 250 ms, ease-out expo; entrada escalonada una vez; `prefers-reduced-motion` anula todo.

---

## Refinamiento v2 — "se siente el material" (nov 2026)

Brief del cliente: "bien, pero básica; subir de nivel en UX, UI y diseño". Se conserva contenido, estructura, datos y enlaces; cambia la capa de materia y la jerarquía. Esto reemplaza las líneas anteriores de **Forma** ("sin sombras, sin degradados") y **Movimiento** (≤ 250 ms): ahora hay profundidad y material.

### Materia (todo CSS/SVG inline, sin imágenes; ~3 KB)
| Token | Qué es | Dónde |
|---|---|---|
| `--grain` / `--grain-lt` | ruido fractal (papel kraft / punto claro en fondos oscuros) | fondo de body y de cada sección, papeles, botones |
| `--fibre` | fibra horizontal de cartón (alfa baja) | secciones y tarjetas kraft |
| `--veta` | veta de MDF (turbulencia estirada) | tablero de grabado de Navidad |
| `--burn` `#3b1c0a`, `--burn-hot` `#FF9A3C` | sepia quemado y brasa del láser | títulos `.etch`, vista previa, nombre del pie |
| `--shadow-soft` / `--shadow-lift` | sombras con desplazamiento y blur, neutras | montura de fotos, tarjetas, hover |
| `--arrow` | flecha dibujada por máscara (un solo trazo) | `.btn--go`, enlaces, disco de pieza |

**Grabado láser** = color sepia + `text-shadow` (borde iluminado abajo, sombra interior arriba, halo con desplazamiento). Sin texto con degradado. En la vista previa el láser "quema" el nombre (clip-path 480 ms, brasa → sepia) al entrar en pantalla y tras 320 ms de pausa al escribir (nunca por tecla).

### Estructura y piezas
- **Portada**: titular a escala (hasta 6rem) sobre el muro naranja, trazo caligráfico SVG bajo "se abren" (eco del wordmark, solo ahí); el producto es el héroe: recorte del flyer de campaña a la zona de cajitas (sin titulares ni teléfono duplicados) dentro de una caja de cartón; dos solapas se abren al cargar (rotateY, 420 ms, solo CSS); etiqueta kraft colgada con logo y la nota "Precio, medidas y entrega". Recorte por variables `--ar/--iw/--il/--it` (móvil y ≥900px distintos).
- **Bordes troquelados**: cada sección (salvo la portada) trae un festón de 14 px (máscara radial) que muerde la sección anterior; recibo y hoja "Sobre mí" conservan el zigzag; sombra en el contenedor `.sheet-wrap` con `filter: drop-shadow` porque `clip-path` recorta `box-shadow`.
- **Catálogo**: una pieza destacada (renos: la foto más nítida, sin marca de agua) con CTA propio + 7 piezas en columnas de altura natural (sin recortes a 4:5), montura de papel con `mix-blend-mode: multiply` que integra fondos blancos/grises dispares. Cada pieza es un solo enlace (disco con flecha, nombre accesible "…: preguntar por WhatsApp") + un CTA global al pie. Se eliminaron las franjas de color rotativas y los 8 "Consulta por WhatsApp".
- **Navidad**: guinda con grano, estrellas doradas dibujadas con `clip-path` en la lista, foto con marco de cartón, tablero de MDF con veta y marco grabado.
- **Bitácora / portafolio / contacto / pie**: fichas de papel con sombra y hover (solo con `(hover:hover)`), zoom de imagen en portafolio, nombre del pie "grabado" en la pared.
- **Móvil**: fila de enlaces desplazable bajo la barra (antes no había navegación), barra fija inferior de WhatsApp que aparece al pasar el CTA de la portada y se oculta cuando el contacto ya trae su botón (respeta `env(safe-area-inset-bottom)`; el pie reserva su altura, no tapa contenido).

### Tipografía
`--step-hero` clamp(3rem, 2rem + 4.2vw, 6rem); `--step-head` clamp(2.1rem, 1.2rem + 3.7vw, 4.5rem); titulares con tracking −0.025/−0.035em. Sigue Fraunces 700/400 + Instrument Sans 400/600 (autoalojadas, sin pesos nuevos).

### Movimiento (un momento autoral + reveals)
Momento: la caja que se abre. Resto: entrada escalonada (≤ 420 ms, transform/opacity, expo ease-out), trazo del titular (scaleX), quemado del nombre, barra inferior (320 ms), hover de botón/ficha/disco. Todo detrás de `prefers-reduced-motion` (solapas ocultas, sin entradas). Sin librerías.

### Reglas que se mantienen
Contraste AA (tinta sobre naranja 5:1; el nombre del pie ahora ≥ 4.5:1), hover solo con puntero fino, objetivos ≥ 44 px, copia sin precios/medidas inventados.

### Limitaciones conocidas
Las fotos de Facebook varían en resolución (300–960 px) y varias traen marca de agua propia (corbata, portallaves, cubo): el diseño las enmarca pero no las repara. Sustituir por fotos originales es la mejora de mayor impacto pendiente.
