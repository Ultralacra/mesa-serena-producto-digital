import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import puppeteer from "puppeteer";
import { recipes as rawRecipes } from "./recipes.mjs";
import { menus, substitutions } from "./guides.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const outDir = join(root, "content");
const htmlPath = join(outDir, "recetario.html");
const pdfPath = join(outDir, "Mesa-Serena-recetario.pdf");
const fonts = join(root, "node_modules", "@fontsource");
const font = (rel) => pathToFileURL(join(fonts, rel)).href;

const fix = {
  11: {
    why: "Pabellón de casa: ensalada grande, carne, caraotas y arroz medidos. Una tajada al horno o ninguna.",
    tip: "La familia come del mismo caldero. En tu plato gana la ensalada.",
  },
  27: { why: "Quinoa con pollo y aguacate. La quinoa también es harina: media taza cocida." },
  28: { why: "Pescado al horno con auyama. Si no hay salmón, trucha o merluza." },
  40: {
    why: "Queso al horno, tres palitos, panado con avena o ajonjolí.",
    tip: "Horno, no freidora. Pepino o ensalada al lado.",
  },
  46: {
    why: "Café de todos los días, sin azúcar. Canela y vainilla cubren el amargo.",
    tip: "Si vuelve el azúcar al café, el resto del día cuesta más.",
  },
  47: {
    why: "Asado de domingo. Color con cebolla frita y un chorrito de café, sin papelón.",
    tip: "Acompaña con vegetales y 3 cucharadas de arroz, o solo ensalada.",
  },
  49: {
    why: "Una hallaca, masa delgada, relleno de pollo. Ensalada al lado.",
    tip: "Una hallaca es el plato. No la torre ni el pan de jamón encima.",
  },
  50: {
    why: "Lechosa, coco y canela. Postre criollo sin papelón.",
    tip: "Porción de cuchara, no de fuente. Cubre el antojo de majarete.",
  },
};

const recipes = rawRecipes.map((r) => ({ ...r, ...(fix[r.n] || {}) }));
let folio = 0;

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sheet(inner, extra = "") {
  folio += 1;
  const n = String(folio).padStart(2, "0");
  return `<section class="sheet ${extra}">
    ${inner}
    <footer><span>Mesa Serena</span><b>${n}</b></footer>
  </section>`;
}

function items(text) {
  return text
    .split(/,(?![^(]*\))/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => `<li>${esc(x)}</li>`)
    .join("");
}

function steps(text) {
  const parts = text
    .split(/(?<=\.)\s+/)
    .map((x) => x.trim())
    .filter((x) => x.length > 3);
  return (parts.length ? parts : [text])
    .map((x, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span><p>${esc(x)}</p></li>`)
    .join("");
}

function recipePage(r) {
  return sheet(
    `<header class="top">
      <span>${esc(r.cat)}</span>
      <span>${esc(r.pocket)} · 1 persona</span>
    </header>
    <p class="rn">${String(r.n).padStart(2, "0")}</p>
    <h1>${esc(r.title)}</h1>
    <p class="pull">${esc(r.why)}</p>
    <div class="split">
      <div>
        <h3>Ingredientes</h3>
        <ul class="ings">${items(r.ings)}</ul>
      </div>
      <div>
        <h3>Preparación</h3>
        <ol class="steps">${steps(r.how)}</ol>
      </div>
    </div>
    <div class="footnotes">
      <p><em>En la cocina</em>${esc(r.tip)}</p>
      <p><em>Evita</em>${esc(r.no)}</p>
    </div>`,
    "recipe",
  );
}

function opener(cat, list) {
  const lis = list
    .map(
      (r) =>
        `<li><span>${String(r.n).padStart(2, "0")}</span><strong>${esc(r.title)}</strong><i>${esc(r.pocket)}</i></li>`,
    )
    .join("");
  return sheet(
    `<p class="eyebrow">Capítulo</p>
    <h1 class="display">${esc(cat)}</h1>
    <p class="lead">${list.length} recetas. Una persona. El bolsillo va al lado del nombre.</p>
    <ol class="index">${lis}</ol>`,
  );
}

function menuPage(menu) {
  const days = menu.days
    .map(
      (d) => `<article class="day">
        <h2>${esc(d[0])}</h2>
        <div>
          <p><b>Desayuno</b>${esc(d[1])}</p>
          <p><b>Almuerzo</b>${esc(d[2])}</p>
          <p><b>Merienda</b>${esc(d[3])}</p>
          <p><b>Cena</b>${esc(d[4])}</p>
        </div>
      </article>`,
    )
    .join("");
  const market = menu.market.map((i) => `<li>${esc(i)}</li>`).join("");
  return sheet(
    `<p class="eyebrow">Siete días</p>
    <h1 class="display small-display">${esc(menu.title)}</h1>
    <p class="lead">${esc(menu.lead)}</p>
    <div class="days">${days}</div>
    <h3 class="later">Mercado</h3>
    <ul class="market">${market}</ul>`,
  );
}

const chapters = ["Desayuno", "Almuerzo", "Cena", "Merienda", "Domingo"].map((cat) => ({
  cat,
  list: recipes.filter((r) => r.cat === cat),
}));

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Mesa Serena</title>
<style>
  @font-face { font-family: Display; src: url("${font("cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff")}") format("woff"); font-weight: 500; font-style: normal; }
  @font-face { font-family: Display; src: url("${font("cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff")}") format("woff"); font-weight: 600; font-style: normal; }
  @font-face { font-family: Display; src: url("${font("cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff")}") format("woff"); font-weight: 500; font-style: italic; }
  @font-face { font-family: Text; src: url("${font("source-serif-4/files/source-serif-4-latin-400-normal.woff")}") format("woff"); font-weight: 400; }
  @font-face { font-family: Text; src: url("${font("source-serif-4/files/source-serif-4-latin-600-normal.woff")}") format("woff"); font-weight: 600; }
  @font-face { font-family: Sans; src: url("${font("manrope/files/manrope-latin-400-normal.woff")}") format("woff"); font-weight: 400; }
  @font-face { font-family: Sans; src: url("${font("manrope/files/manrope-latin-600-normal.woff")}") format("woff"); font-weight: 600; }
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #efe8dc; }
  .sheet {
    width: 210mm;
    height: 297mm;
    padding: 16mm 18mm 18mm;
    position: relative;
    page-break-after: always;
    background:
      radial-gradient(420px 180px at 100% 0%, rgba(196,164,106,.16), transparent 60%),
      #f7f2ea;
    color: #241c16;
    overflow: hidden;
  }
  footer {
    position: absolute;
    left: 18mm;
    right: 18mm;
    bottom: 9mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 0.4pt solid #d9ccb6;
    padding-top: 5pt;
    font-family: Sans, sans-serif;
    font-size: 7.5pt;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #8d7f6a;
  }
  footer b { font-weight: 600; letter-spacing: 0.08em; }
  .eyebrow, h3, .top, .meta {
    font-family: Sans, sans-serif;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-size: 8pt;
    font-weight: 600;
    color: #8a6a45;
  }
  h1, h2, .rn { font-family: Display, serif; font-weight: 500; color: #163028; }
  .display { font-size: 54pt; line-height: 0.9; letter-spacing: -0.03em; margin: 6pt 0 10pt; }
  .small-display { font-size: 32pt; }
  .lead { font-family: Text, serif; font-size: 12pt; line-height: 1.45; color: #4d463c; max-width: 36em; margin-bottom: 14pt; }
  .cover {
    background: #14261f;
    color: #f6f0e6;
    padding: 22mm 20mm 22mm 24mm;
  }
  .cover::before {
    content: "";
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 8mm;
    background: #c45c3a;
  }
  .cover h1 { color: #f6f0e6; font-size: 78pt; line-height: 0.82; font-weight: 500; }
  .cover h1 em { font-style: italic; color: #e7c98a; }
  .cover .eyebrow { color: #e7c98a; }
  .cover .deck { margin-top: 18pt; max-width: 16em; font-family: Text, serif; font-size: 14pt; line-height: 1.4; color: #e7dfd2; }
  .cover .rule { width: 42mm; height: 0.6pt; background: #e7c98a; margin: 22pt 0; }
  .cover ul { list-style: none; font-family: Sans, sans-serif; letter-spacing: 0.18em; text-transform: uppercase; font-size: 8pt; color: #e7c98a; }
  .cover li { margin: 6pt 0; }
  .cover footer { color: #cbb892; border-color: rgba(231,201,138,.35); }
  .index { list-style: none; columns: 2; column-gap: 16pt; }
  .index li {
    break-inside: avoid;
    display: grid;
    grid-template-columns: 18pt 1fr auto;
    gap: 8pt;
    align-items: baseline;
    padding: 5.5pt 0;
    border-bottom: 0.4pt solid #e4d8c6;
    font-family: Text, serif;
    font-size: 11pt;
  }
  .index span { font-family: Display, serif; font-style: italic; color: #c45c3a; font-size: 13pt; }
  .index i { font-style: normal; font-family: Sans, sans-serif; font-size: 7.5pt; letter-spacing: 0.12em; text-transform: uppercase; color: #8d7f6a; }
  .top { display: flex; justify-content: space-between; border-bottom: 0.4pt solid #d9ccb6; padding-bottom: 7pt; }
  .rn {
    font-size: 64pt;
    line-height: 0.8;
    font-style: italic;
    color: #c45c3a;
    margin: 12pt 0 2pt;
  }
  .recipe h1 { font-size: 28pt; line-height: 1.02; max-width: 16em; margin-bottom: 8pt; }
  .pull { font-family: Display, serif; font-style: italic; font-size: 15pt; line-height: 1.25; color: #3d4a42; max-width: 28em; margin-bottom: 14pt; }
  .split { display: grid; grid-template-columns: 0.86fr 1.14fr; gap: 16pt; }
  h3 { margin-bottom: 8pt; }
  .ings { list-style: none; }
  .ings li {
    font-family: Text, serif;
    font-size: 11pt;
    padding: 4.5pt 0 4.5pt 12pt;
    border-bottom: 0.4pt solid #eadfce;
    position: relative;
  }
  .ings li::before {
    content: "";
    width: 4pt; height: 4pt; border-radius: 50%;
    background: #c45c3a;
    position: absolute; left: 0; top: 10pt;
  }
  .steps { list-style: none; }
  .steps li { display: grid; grid-template-columns: 22pt 1fr; gap: 8pt; margin: 0 0 9pt; }
  .steps span { font-family: Display, serif; font-style: italic; color: #c45c3a; font-size: 14pt; line-height: 1; }
  .steps p { font-family: Text, serif; font-size: 11.5pt; line-height: 1.4; }
  .footnotes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14pt;
    margin-top: 16pt;
    padding-top: 10pt;
    border-top: 0.4pt solid #d9ccb6;
  }
  .footnotes p { font-family: Text, serif; font-size: 10pt; line-height: 1.35; color: #3f3830; }
  .footnotes em {
    display: block;
    font-family: Sans, sans-serif;
    font-style: normal;
    font-size: 7.5pt;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #8a6a45;
    margin-bottom: 3pt;
  }
  .plate { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 18pt; align-items: start; }
  .rule-list { list-style: none; }
  .rule-list li {
    font-family: Text, serif;
    font-size: 12pt;
    padding: 8pt 0;
    border-bottom: 0.4pt solid #e4d8c6;
  }
  .rule-list strong { font-family: Display, serif; font-weight: 500; font-size: 16pt; color: #163028; display: block; }
  .mark {
    border: 0.6pt solid #c4a46a;
    min-height: 78mm;
    padding: 14pt;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .mark b { font-family: Display, serif; font-size: 28pt; font-weight: 500; line-height: 0.95; color: #163028; }
  .thirds { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12pt; margin-top: 8pt; }
  .thirds article { padding-top: 8pt; border-top: 2.5pt solid #163028; }
  .thirds article:nth-child(2) { border-color: #c4a46a; }
  .thirds article:nth-child(3) { border-color: #c45c3a; }
  .thirds h2 { font-size: 20pt; margin-bottom: 8pt; }
  .thirds p { font-family: Text, serif; font-size: 10pt; line-height: 1.4; }
  .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10pt 16pt; }
  .cards article { padding: 10pt 0 12pt; border-top: 0.6pt solid #163028; }
  .cards h2 { font-size: 20pt; margin-bottom: 4pt; }
  .cards p { font-family: Text, serif; font-size: 11pt; }
  .days { margin-top: 4pt; }
  .day {
    display: grid;
    grid-template-columns: 28mm 1fr;
    gap: 8pt;
    padding: 5pt 0;
    border-bottom: 0.4pt solid #e4d8c6;
  }
  .day h2 { font-size: 16pt; font-style: italic; }
  .day div { display: grid; grid-template-columns: 1fr 1fr; gap: 2pt 12pt; }
  .day p { font-family: Text, serif; font-size: 9.5pt; }
  .day b {
    display: block;
    font-family: Sans, sans-serif;
    font-size: 7pt;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #8a6a45;
    font-weight: 600;
  }
  .later { margin: 12pt 0 6pt; }
  .market { columns: 2; padding-left: 14pt; font-family: Text, serif; font-size: 10pt; }
  .market li { margin: 2pt 0; }
  table { width: 100%; border-collapse: collapse; }
  td { font-family: Text, serif; font-size: 10.5pt; vertical-align: top; padding: 7pt 8pt 7pt 0; border-bottom: 0.4pt solid #e4d8c6; }
  td:first-child { font-family: Display, serif; font-size: 13pt; color: #163028; width: 38%; }
</style>
</head>
<body>

<section class="sheet cover">
  <p class="eyebrow">Recetario criollo</p>
  <div style="margin-top:28mm">
    <h1>Mesa<br/><em>Serena</em></h1>
    <div class="rule"></div>
    <p class="deck">Cincuenta recetas para cocinar en casa con diabetes. Arepa, pabellón, pollo, auyama y domingo.</p>
  </div>
  <ul>
    <li>01 — El plato</li>
    <li>02 — La cocina venezolana</li>
    <li>03 — Desayunos a domingo</li>
    <li>04 — Menús y mercado</li>
  </ul>
  <footer><span>Guía educativa de cocina</span><b>01</b></footer>
</section>

${(() => {
  folio = 1;
  return "";
})()}

${sheet(`<p class="eyebrow">Contenido</p>
  <h1 class="display">Dentro</h1>
  <ol class="index">
    <li><span>01</span><strong>Cómo armar el plato</strong><i>Método</i></li>
    <li><span>02</span><strong>Semáforo de cocina</strong><i>Guía</i></li>
    <li><span>03</span><strong>La arepa</strong><i>Guía</i></li>
    <li><span>04</span><strong>Desayunos</strong><i>01–10</i></li>
    <li><span>05</span><strong>Almuerzos</strong><i>11–28</i></li>
    <li><span>06</span><strong>Cenas</strong><i>29–38</i></li>
    <li><span>07</span><strong>Meriendas</strong><i>39–46</i></li>
    <li><span>08</span><strong>Domingo</strong><i>47–50</i></li>
    <li><span>09</span><strong>Tres semanas de menú</strong><i>Mercado</i></li>
    <li><span>10</span><strong>Sustituciones</strong><i>Cocina</i></li>
  </ol>`)}

${sheet(`<p class="eyebrow">Método</p>
  <h1 class="display" style="font-size:42pt">Cómo armar<br/>el plato</h1>
  <div class="plate">
    <ul class="rule-list">
      <li><strong>Mitad vegetales</strong>Ensalada, pepino, tomate, repollo, vainitas, berenjena, calabacín, hojas, auyama. Si no se ven, no están.</li>
      <li><strong>Un cuarto proteína</strong>Huevo, pollo, carne, pescado, sardina o atún.</li>
      <li><strong>Un cuarto harina</strong>Una sola: arepa pequeña, yuca de un puño, 3 cucharadas de arroz o un cucharón de caraotas.</li>
      <li><strong>Bebida</strong>Agua o café sin azúcar. Fruta entera, en porción. Nada de jugo.</li>
    </ul>
    <div class="mark">
      <b>Una harina por comida.</b>
      <p class="lead" style="margin:0">Queso: una cucharada. Aceite: un chorrito. Sofrito sin papelón. La familia come del mismo caldero; tú sirves tu porción.</p>
    </div>
  </div>
  <p class="lead" style="margin-top:16pt">Recetario educativo. No diagnostica, no trata y no sustituye a tu médico. Si usas insulina o pastillas, cualquier cambio de comida se habla con ellos. Cada receta es para una persona.</p>`)}

${sheet(`<p class="eyebrow">Guía</p>
  <h1 class="display" style="font-size:40pt">Semáforo de<br/>la cocina</h1>
  <p class="lead">No es una lista de prohibidos. Es cómo se usa lo del mercado.</p>
  <div class="thirds">
    <article>
      <h2>A diario</h2>
      <p>Huevo, pollo, pescado de mercado, sardina, atún al agua, carne magra. Tomate, cebolla, ají, cilantro, pepino, lechuga, repollo, vainita, berenjena, calabacín, auyama. Limón, ajo, comino, canela. Café sin azúcar. Agua. Avena en hojuelas. Caraotas y lentejas en porción, con ensalada.</p>
    </article>
    <article>
      <h2>En porción</h2>
      <p>Arepa de palma. Yuca o ñame: un puño. Arroz: 3 cucharadas a media taza. Tres tostones al horno. Casabe pequeño. Una cucharada de queso. Un tercio de aguacate. Una tajada al horno. Dos mini empanadas horneadas. Una hallaca. Media taza de quinoa. Fruta entera.</p>
    </article>
    <article>
      <h2>Casi nunca</h2>
      <p>Jugo, aunque sea natural. Papelón en los guisos. Azúcar en el café. Refresco. Arepa de plato con queso y jugo. Empanada frita. Plátano maduro frito a montón. Torre de arroz. Mayonesa a cucharadas. Ketchup. Leche condensada. Avena de sobrecito. Yogurt de sabores.</p>
    </article>
  </div>
  <p class="lead" style="margin-top:16pt">Arepa, yuca y caraota se miden. El pico casi siempre viene del combo, no de un alimento solo.</p>`)}

${sheet(`<p class="eyebrow">Guía</p>
  <h1 class="display" style="font-size:48pt">La arepa</h1>
  <p class="lead">Del tamaño de la palma, delgada, con proteína adentro. No del tamaño del plato.</p>
  <div class="cards">
    <article><h2>Tamaño</h2><p>Cabe en la mano, unos 8 a 10 cm. Si al partirla parece una torta, está grande. Una por comida.</p></article>
    <article><h2>Relleno</h2><p>Pollo, huevo, carne, atún o sardina. Queso: una cucharada. Vegetal si cabe.</p></article>
    <article><h2>No la juntes</h2><p>Con jugo, café azucarado, yuca, pan, queso a paladas ni mantequilla a chorro.</p></article>
    <article><h2>Con auyama</h2><p>Mitad harina PAN, mitad auyama cocida. Sigue siendo pequeña. Receta 04.</p></article>
  </div>
  <p class="lead" style="margin-top:18pt">El desayuno que se puede repetir: receta 01, café con canela y pepino si queda hambre.</p>`)}

${chapters.map(({ cat, list }) => opener(cat, list) + list.map(recipePage).join("")).join("")}

${menuPage(menus.diario)}
${menuPage(menus.comodo)}
${menuPage(menus.elevado)}

${sheet(`<p class="eyebrow">Cocina</p>
  <h1 class="display" style="font-size:40pt">Sustituciones</h1>
  <p class="lead">Se cambia el ingrediente. El hábito se queda.</p>
  <table>
    <tbody>
      ${substitutions.map((row) => `<tr><td>${esc(row[0])}</td><td>${esc(row[1])}</td></tr>`).join("")}
    </tbody>
  </table>`)}

</body></html>`;

mkdirSync(outDir, { recursive: true });
writeFileSync(htmlPath, html);

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--font-render-hinting=none"],
});
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load", timeout: 120000 });
await page.evaluate(() => document.fonts.ready);
await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
});

await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
const sheets = await page.$$(".sheet");
const shots = [0, 2, 6, 8];
for (const index of shots) {
  if (!sheets[index]) continue;
  await sheets[index].screenshot({
    path: join(outDir, `preview-${index}.png`),
  });
}
await browser.close();

console.log("PDF", pdfPath);
console.log("BYTES", readFileSync(pdfPath).length);
console.log("PAGES", folio + 1);
