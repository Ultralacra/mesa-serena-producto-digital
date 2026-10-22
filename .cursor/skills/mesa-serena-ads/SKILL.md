---
name: mesa-serena-ads
description: Crea y renderiza videos publicitarios de Mesa Serena con Remotion para Meta Ads (Reels 9:16), con la identidad, el precio vigente y las reglas médicas del producto. Use when the user asks to create, edit, caption or render videos, reels, ads or anuncios for Mesa Serena in the videos/ folder.
---

# Mesa Serena — videos para Meta Ads

Proyecto de video: `videos/` (Remotion 4, React 19). Composiciones en `videos/src/`, assets en `videos/public/img/`, renders en `videos/out/`.

Antes de escribir markup, cargar también las skills oficiales instaladas en `videos/.agents/skills/`: `remotion-create` o `remotion-markup` según la tarea, `remotion-captions` si hay subtítulos de audio, y `remotion-render` para exportar.

## Datos del producto (verificar, no inventar)

- Precio vigente: leer `NEXT_PUBLIC_PRICE_USD` en `web/.env.example` o `priceUsd` en `web/lib/product.ts`. Nunca usar precios de guiones viejos.
- Pago: en bolívares a tasa BCV, desde la web. El CTA del video y de la landing es **“Quiero mi recetario”**.
- Entrega: el recetario llega al correo al aprobarse el pago, con descarga también en la pantalla de gracias. En anuncios y videos NO decir “llega un PDF”: decir “tu recetario llega directo a tu correo”.
- Contenido: 50 recetas criollas (30 bolsillo diario, 14 cómodo, 6 elevado), 3 menús de 7 días, lista de mercado y 6 guías dentro del mismo PDF.

## Identidad

| Color | Hex | Uso |
|---|---|---|
| Bosque | `#1B3A2F` | Fondos, paneles |
| Bosque profundo | `#12261F` | Fondo CTA, texto sobre crema |
| Crema | `#F6F0E4` | Fondos claros, texto sobre bosque |
| Papel | `#FFFBF4` | Tarjetas |
| Terracota | `#C45C3A` | Precio, botón, énfasis (un solo acento por escena) |
| Oro | `#C4A46A` | Filetes, kickers |
| Sage | `#5C7A6A` | Detalles secundarios |

Tipografía: Instrument Serif para titulares (itálica para la frase emocional), Manrope para cuerpo, precio y CTA. Nada de fuentes de sistema en el render final.

## Formato Meta Ads

- Lienzo 1080×1920, 30 fps, 15–25 segundos. Sin audio obligatorio: el video debe entenderse en silencio.
- Gancho visual + texto grande en los primeros 2 segundos. Una idea por video, una idea por escena.
- Texto dentro de márgenes de 90 px; nada importante en los últimos 260 px (la interfaz de Meta tapa esa zona) salvo el descargo.
- Subtítulos quemados siempre: titulares de 84 px o más, cuerpo de 38 px o más, contraste crema sobre bosque o bosque sobre crema.
- Cada escena entra con un movimiento (zoom lento en la foto, panel que sube, portada con spring). Nada de cortes secos sin transición ni de texto que aparece de golpe sin fade.
- Cierre fijo: precio, botón “Quiero mi recetario”, “Tu recetario llega directo a tu correo” y descargo visible.

## Reglas que no se rompen

- Prohibido prometer resultados de salud: nada de “cura”, “baja la glicemia”, “deja la pastilla”, “garantizado”. El recetario es educativo.
- Descargo en el cierre: “Recetario educativo. No sustituye a tu médico.”
- Nada de WhatsApp, Zelle, Binance ni “escribe la palabra” como vía de compra: la compra es en la web.
- No nombrar la pasarela de pago en el botón ni en el CTA.
- Ingredientes y platos venezolanos reales (arepa, pabellón, pollo, caraotas, auyama). Nada de stock gringo ni de comida “fit” importada.

## Flujo de trabajo

1. Leer el guion en `anuncios/guiones-video.md` y contrastarlo con los datos vigentes del producto (los guiones pueden traer precio viejo).
2. Abrir el Studio (`npm run studio` en `videos/`) antes de editar, y dejarlo corriendo.
3. Escribir la composición con una escena por componente y `Sequence` con `from`/`durationInFrames` usando `fps` de `useVideoConfig()`.
4. Renderizar stills de control (inicio, mitad de cada escena, cierre) y mirarlos antes del render final.
5. Renderizar a `videos/out/` con `npm run render:ad01` o el script de la composición, y verificar duración, tamaño y que el texto no se salga.
6. Al terminar código, correr `graphify update .` en la raíz y subir los cambios a `main` con un commit en español.
