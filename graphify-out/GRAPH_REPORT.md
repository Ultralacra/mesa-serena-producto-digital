# Graph Report - producto digital  (2026-10-22)

## Corpus Check
- 38 files · ~341,149 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 398 nodes · 540 edges · 24 communities (19 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e8d87845`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- MESA SERENA
- CENAS (29–38)
- skylink.ts
- deliver.ts
- compilerOptions
- CENAS (29–38)
- devDependencies
- build-pdf.mjs
- Guiones de anuncios en imagen
- gracias/page.tsx
- ALMUERZOS (11–28)
- package.json
- ALMUERZOS (11–28)
- DESAYUNOS (1–10)
- Guiones de video (Reels / Ads 9:16)
- send-test-mail.mjs
- layout.tsx
- web/README.md
- vercel.json
- Mesa Serena
- 00-paleta-y-uso.md
- AGENTS.md
- eslint.config.mjs
- next.config.ts

## God Nodes (most connected - your core abstractions)
1. `ALMUERZOS (11–28)` - 19 edges
2. `ALMUERZOS (11–28)` - 19 edges
3. `MESA SERENA` - 18 edges
4. `logFlow()` - 17 edges
5. `compilerOptions` - 16 edges
6. `DESAYUNOS (1–10)` - 11 edges
7. `CENAS (29–38)` - 11 edges
8. `DESAYUNOS (1–10)` - 11 edges
9. `CENAS (29–38)` - 11 edges
10. `deliverByRef()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `logFlow()`  [EXTRACTED]
  web/app/api/checkout/route.ts → web/lib/log.ts
- `POST()` --calls--> `saveOrder()`  [EXTRACTED]
  web/app/api/checkout/route.ts → web/lib/orders.ts
- `POST()` --calls--> `watchPaymentLocally()`  [EXTRACTED]
  web/app/api/checkout/route.ts → web/lib/watch-payment.ts
- `GET()` --calls--> `bcvRate()`  [EXTRACTED]
  web/app/api/rate/route.ts → web/lib/skylink.ts
- `deliverRecetario()` --calls--> `recetarioAttachment()`  [EXTRACTED]
  web/lib/deliver.ts → web/lib/mail.ts

## Import Cycles
- None detected.

## Communities (24 total, 5 thin omitted)

### Community 0 - "MESA SERENA"
Cohesion: 0.04
Nodes (44): 10. Cómo se cierra (la venta de verdad), 11. Objeciones y respuestas cortas, 12. Embudo real (Instagram en Venezuela), 13. Contenido orgánico que vende (sin parecer infomercial), 14. Promesa que SÍ puedes hacer vs. la que te puede joder, 15. Cómo se ve el producto cuando lo vendas, 16. Plan de 10 días (antes del PDF bonito), 1. Veredicto (+36 more)

### Community 1 - "CENAS (29–38)"
Cohesion: 0.05
Nodes (38): 10. Mini cachapa de jojoto con huevo — Cómodo, 1. Perico de vegetales con arepa pequeña — Diario, 29. Crema de auyama (sin crema de leche) — Diario, 2. Avena cremosa de canela — Diario, 30. Caldo de pollo con vegetales — Diario, 31. Ensalada tibia de lentejas — Diario, 32. Sardinas al limón con pepino — Diario, 33. Wrap de lechuga con pollo y queso — Diario (+30 more)

### Community 2 - "skylink.ts"
Cohesion: 0.13
Nodes (26): POST(), GET(), bonuses, faqs, Home(), includes, pains, priceQuote() (+18 more)

### Community 3 - "deliver.ts"
Cohesion: 0.22
Nodes (23): GET(), POST(), SkylinkWebhook, deliverByRef(), deliverRecetario(), logFlow(), logPaidAndMailed(), notifyMailWebhook() (+15 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "CENAS (29–38)"
Cohesion: 0.07
Nodes (27): 29. Crema de auyama (sin crema de leche) — Diario, 30. Caldo de pollo con vegetales — Diario, 31. Ensalada tibia de lentejas — Diario, 32. Sardinas al limón con pepino — Diario, 33. Wrap de lechuga con pollo y queso — Diario, 34. Huevos al plato con tomate y ají — Diario, 35. Sopa de verduras del mercado — Diario, 36. Pescado en salsa de coco light — Cómodo (+19 more)

### Community 6 - "devDependencies"
Cohesion: 0.09
Nodes (23): eslint, eslint-config-next, @fontsource/cormorant-garamond, @fontsource/manrope, @fontsource/source-serif-4, puppeteer, @types/node, @types/nodemailer (+15 more)

### Community 7 - "build-pdf.mjs"
Cohesion: 0.14
Nodes (19): chapters, esc(), fix, fonts, htmlPath, items(), menuPage(), opener() (+11 more)

### Community 8 - "Guiones de anuncios en imagen"
Cohesion: 0.10
Nodes (20): Copy extra si el anuncio pide “titular / descripción” separados (Administrador de anuncios), CTA, CTA, CTA del botón, Descripción corta, Descripción corta, Guiones de anuncios en imagen, IMAGEN 01 — Arepa (+12 more)

### Community 9 - "gracias/page.tsx"
Cohesion: 0.16
Nodes (13): POST(), Body(), first(), metadata, paymentToken(), ReturnView(), Status, recetarioAttachment() (+5 more)

### Community 10 - "ALMUERZOS (11–28)"
Cohesion: 0.11
Nodes (19): 11. Pabellón controlado — Diario, 12. Caraotas negras, huevo y ensalada — Diario, 13. Pollo guisado con auyama — Diario, 14. Carne mechada sin papelón — Diario, 15. Pescado al horno con ensalada criolla — Diario, 16. Hervido liviano de pollo — Diario, 17. Lentejas criollas — Diario, 18. Atún con ensalada de huevo — Diario / Cómodo (+11 more)

### Community 11 - "package.json"
Cohesion: 0.11
Nodes (18): next, nodemailer, react, react-dom, dependencies, next, nodemailer, react (+10 more)

### Community 12 - "ALMUERZOS (11–28)"
Cohesion: 0.11
Nodes (19): 11. Pabellón controlado — Diario, 12. Caraotas negras, huevo y ensalada — Diario, 13. Pollo guisado con auyama — Diario, 14. Carne mechada sin papelón — Diario, 15. Pescado al horno con ensalada criolla — Diario, 16. Hervido liviano de pollo — Diario, 17. Lentejas criollas — Diario, 18. Atún con ensalada de huevo — Diario / Cómodo (+11 more)

### Community 13 - "DESAYUNOS (1–10)"
Cohesion: 0.18
Nodes (11): 10. Mini cachapa de jojoto con huevo — Cómodo, 1. Perico de vegetales con arepa pequeña — Diario, 2. Avena cremosa de canela — Diario, 3. Huevos con espinaca y queso blanco — Diario, 4. Arepa de auyama rellena de pollo — Diario, 5. Omelette de ají dulce, cebolla y tomate — Diario, 6. Panqueques de avena y huevo — Diario, 7. Café con leche, huevo y tomate — Diario (+3 more)

### Community 14 - "Guiones de video (Reels / Ads 9:16)"
Cohesion: 0.25
Nodes (7): Cómo grabarlo aunque no tengas set, Guiones de video (Reels / Ads 9:16), Mesa Serena — 15 a 30 segundos, VIDEO 01 — Arepa (el de más alcance), VIDEO 02 — Mercado (el que convierte a quien no tiene plata), VIDEO 03 — Mamá / familia (el que se comparte), VIDEO 04 — Desayuno (reserva, para cuando el de arepa se gaste)

### Community 15 - "send-test-mail.mjs"
Cohesion: 0.33
Nodes (5): env, root, stamp, to, transport

### Community 16 - "layout.tsx"
Cohesion: 0.40
Nodes (3): metadata, sans, serif

### Community 17 - "web/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 18 - "vercel.json"
Cohesion: 0.50
Nodes (3): buildCommand, framework, installCommand

## Knowledge Gaps
- **250 isolated node(s):** `SkylinkWebhook`, `metadata`, `serif`, `sans`, `metadata` (+245 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 265 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `MESA SERENA — Catálogo de 50 recetas` connect `CENAS (29–38)` to `ALMUERZOS (11–28)`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `MESA SERENA — Catálogo de 50 recetas` connect `CENAS (29–38)` to `ALMUERZOS (11–28)`, `DESAYUNOS (1–10)`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `ALMUERZOS (11–28)` connect `ALMUERZOS (11–28)` to `CENAS (29–38)`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `SkylinkWebhook`, `metadata`, `serif` to the rest of the system?**
  _250 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `MESA SERENA` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Should `CENAS (29–38)` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `skylink.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13257575757575757 - nodes in this community are weakly interconnected._