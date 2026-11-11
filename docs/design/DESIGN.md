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
