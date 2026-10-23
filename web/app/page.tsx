import Image from "next/image";
import { CheckoutForm } from "@/components/CheckoutForm";
import { formatVes, PRODUCT, WHATSAPP_URL } from "@/lib/product";
import { bcvRate } from "@/lib/skylink";

async function priceQuote() {
  try {
    const rate = await bcvRate();
    return {
      rate,
      ves: Math.round(PRODUCT.priceUsd * rate * 100) / 100,
    };
  } catch {
    return null;
  }
}

const pains = [
  {
    num: "01",
    title: "Te quitaron la arepa",
    text: "No se acabó. Se acabó la del tamaño de un plato, con jugo y café con azúcar. Arepa pequeña, con pollo o huevo, y ensalada al lado.",
  },
  {
    num: "02",
    title: "Eso “saludable” no está en tu mercado",
    text: "Si el recetario empieza con quinoa y salmón, no es para tu cocina. Aquí el plato sale con huevo, pollo, caraota y auyama.",
  },
  {
    num: "03",
    title: "Cocinas para todos y tú comes aparte",
    text: "Un solo caldero. Ellos comen pabellón. Tú comes el mismo pabellón, en tu porción. Sin plato de enferma.",
  },
];

const includes = [
  "El calendario de 7 días, con desayuno, almuerzo, merienda y cena ya escritos",
  "50 recetas con el mercado del día a día: huevo, pollo, caraota, lenteja, sardina y auyama",
  "Los tips: semáforo, la arepa en su punto, y con qué cambias el papelón, el jugo y el arroz",
  "La lista de mercado de la semana, para no pasear el puesto adivinando",
  "Un solo caldero: la casa come lo mismo, tú comes tu porción",
];

const quotes = [
  {
    text: "Por fin un recetario con arepa y caraota, no quinoa.",
    who: "Compradora en Venezuela",
  },
  {
    text: "Se lo compré a mi mamá. Le llegó al correo con su nombre.",
    who: "Regalo para la familia",
  },
  {
    text: "Pagué en bolívares: se validó solo y el PDF llegó al momento.",
    who: "Compra desde el celular",
  },
];

const faqs = [
  {
    q: "¿Cómo pago y en qué moneda?",
    a: "Pagas en bolívares, al equivalente en dólares a la tasa BCV del día, desde tu banco. El pago se valida automáticamente: no envías capturas ni esperas a que alguien te confirme a mano. Sin Zelle, sin Binance y sin chat.",
    open: true,
  },
  {
    q: "¿Cuándo me llega el recetario?",
    a: "En cuanto el sistema valida tu pago (es automático). Te llega un correo con tu recetario digital y, en la pantalla de gracias, también tienes el botón para descargarlo al momento. Si no lo ves en la bandeja, revisa Spam o Promociones.",
  },
  {
    q: "¿Tengo que comprar salmón, quinoa o cosas caras?",
    a: "No. De las 50 recetas, 30 son de bolsillo diario — huevo, pollo, caraota, lenteja, sardina, auyama — y 14 de bolsillo cómodo. Solo 6 son de domingo o visita.",
  },
  {
    q: "¿Esto me baja la glicemia?",
    a: "No, y desconfía de quien te lo prometa. Mesa Serena es un recetario educativo: te enseña a armar comida casera con mejor criterio. Tu médico sigue mandando.",
  },
];

export default async function Home() {
  const quote = await priceQuote();
  const vesLabel = quote ? `≈ ${formatVes(quote.ves)} Bs` : "";
  const rateLabel = quote
    ? `Tasa BCV ${formatVes(quote.rate)}`
    : "Precio en bolívares a tasa BCV al pagar";

  return (
    <>
      <header className="nav">
        <div className="wrap nav-inner">
          <div className="brand">
            <Image
              className="brand-logo"
              src="/img/logo-mesa-serena.svg"
              alt="Mesa Serena"
              width={42}
              height={42}
            />
            <span className="brand-copy">
              <strong>Mesa Serena</strong>
              <small>Guía de comida casera</small>
            </span>
          </div>
          <nav className="nav-links">
            <a href="#incluye">El recetario</a>
            <a href="#comprar">Comprar</a>
          </nav>
          <a className="btn" href="#comprar">
            Quiero mi recetario — {PRODUCT.priceUsd} USD
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="kicker">Mesa Serena</p>
            <h1>
              Con diabetes no se acaba la arepa. <em>Se acaba la improvisación.</em>
            </h1>
            <p className="lead">
              Recetario criollo: 50 platos con huevo, pollo, caraota y auyama.
              Menú de 7 días y lista de mercado. Comida de tu casa, no de Miami.
            </p>
            <div className="price-row">
              <span className="now">{PRODUCT.priceUsd} USD</span>
              {vesLabel ? <span className="ves">{vesLabel}</span> : null}
            </div>
            <p className="fine">{rateLabel}. Pagas en bolívares. PDF al correo.</p>
            <div className="hero-actions">
              <a className="btn btn-lg" href="#comprar">
                Quiero mi recetario
              </a>
            </div>
            <p className="fine">
              Es educativo y acompaña, no reemplaza, a tu médico.
            </p>
            <div className="hero-meta">
              <span className="chip">50 recetas caseras</span>
              <span className="chip">Menú de 7 días</span>
              <span className="chip">Lista de mercado</span>
              <span className="chip">PDF al instante</span>
            </div>
          </div>
          <div className="hero-visual hero-visual-food">
            <div className="hero-food">
              <Image
                className="hero-food-photo"
                src="/img/arepa.jpg"
                alt="Arepa casera con pollo y ensalada — Mesa Serena"
                width={900}
                height={1100}
                priority
              />
              <div className="hero-food-book">
                <Image
                  src="/img/ebook-cover.jpg"
                  alt="Portada del recetario Mesa Serena"
                  width={220}
                  height={293}
                />
              </div>
              <p className="hero-food-caption">Arepa sí. Más pequeña. Mejor acompañada.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section buy-early" id="comprar-wrap">
        <div className="wrap include">
          <div>
            <p className="kicker">Qué te llevas hoy</p>
            <h2>El menú de la semana, con lo que ya está en la nevera.</h2>
            <p className="lead">
              Por {PRODUCT.priceUsd} dólares
              {vesLabel ? ` (${vesLabel})` : ""} dejas de improvisar cada día.
            </p>
            <ul className="clean">
              {includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="social-proof" aria-label="Lo que buscan quienes compran">
              {quotes.map((item) => (
                <blockquote key={item.who}>
                  <p>“{item.text}”</p>
                  <cite>{item.who}</cite>
                </blockquote>
              ))}
            </div>
          </div>
          <aside className="offer" id="comprar">
            <div className="offer-ribbon">Pago validado automático · PDF al correo</div>
            <div className="offer-head">
              <div className="offer-cover">
                <Image
                  src="/img/ebook-cover.jpg"
                  alt="Portada de Mesa Serena"
                  width={168}
                  height={224}
                />
              </div>
              <div>
                <p className="kicker">Tu guía para la mesa</p>
                <h3>Mesa Serena</h3>
                <p className="fine">50 recetas + menú de 7 días + lista de mercado.</p>
              </div>
            </div>
            <CheckoutForm />
          </aside>
        </div>
      </section>

      <section className="proof-strip" aria-label="Lo que recibes al comprar">
        <div className="wrap proof-grid">
          <div>
            <strong>{PRODUCT.priceUsd} USD</strong>
            <span>precio claro</span>
          </div>
          <div>
            <strong>50</strong>
            <span>recetas caseras</span>
          </div>
          <div>
            <strong>7 días</strong>
            <span>de menú resuelto</span>
          </div>
          <div>
            <strong>Hoy</strong>
            <span>directo a tu correo</span>
          </div>
        </div>
      </section>

      <section className="preview section" id="incluye">
        <div className="wrap">
          <div className="section-intro">
            <p className="kicker">Mira lo que vas a recibir</p>
            <h2>Así se ve tu semana por dentro.</h2>
            <p className="lead">
              Abres el celular, eliges el menú y cocinas con lo que ya conoces.
            </p>
          </div>
          <div className="preview-grid">
            <article className="preview-sheet preview-menu">
              <div className="sheet-top">
                <span>MESA SERENA</span>
                <span>01</span>
              </div>
              <p className="sheet-kicker">Tu semana, sin improvisar</p>
              <h3>Menú de 7 días</h3>
              <div className="sheet-rule" />
              <div className="menu-head">
                <span>Día</span>
                <span>Desayuno</span>
                <span>Almuerzo · cena</span>
              </div>
              <div className="menu-lines">
                <div>
                  <b>LUN</b>
                  <span>Perico + arepa pequeña</span>
                  <em>Pabellón · caldo de pollo</em>
                </div>
                <div>
                  <b>MAR</b>
                  <span>Avena de canela</span>
                  <em>Pollo con auyama · sardinas</em>
                </div>
                <div>
                  <b>MIÉ</b>
                  <span>Huevos con espinaca</span>
                  <em>Lentejas · huevos al plato</em>
                </div>
                <div>
                  <b>JUE</b>
                  <span>Café, huevo y tomate</span>
                  <em>Caraotas · crema de auyama</em>
                </div>
                <div>
                  <b>VIE</b>
                  <span>Omelette de ají</span>
                  <em>Pollo saltado · vegetales</em>
                </div>
              </div>
              <p className="sheet-note">Cada día: desayuno, almuerzo, merienda y cena.</p>
            </article>
            <article className="preview-sheet preview-recipe">
              <div className="sheet-top">
                <span>RECETA 12 / 50</span>
                <span>02</span>
              </div>
              <div className="recipe-photo">
                <Image
                  src="/img/arepa.jpg"
                  alt="Arepa pequeña con pollo y ensalada"
                  fill
                  sizes="(max-width: 800px) 100vw, 32vw"
                />
              </div>
              <p className="sheet-kicker">Desayuno casero</p>
              <h3>Arepa de pollo y ensalada</h3>
              <p className="sheet-copy">
                La arepa se queda. Del tamaño de tu palma, con proteína y vegetales.
              </p>
              <div className="recipe-meta">
                <span>Mercado diario</span>
                <span>Fácil</span>
                <span>1 porción</span>
              </div>
            </article>
            <article className="preview-sheet preview-list">
              <div className="sheet-top">
                <span>GUÍA PRÁCTICA</span>
                <span>03</span>
              </div>
              <p className="sheet-kicker">Antes de ir al mercado</p>
              <h3>Tu lista de compras</h3>
              <ul>
                <li>
                  <span>✓</span>Huevos y pollo
                </li>
                <li>
                  <span>✓</span>Caraotas y lentejas
                </li>
                <li>
                  <span>✓</span>Auyama y vegetales
                </li>
                <li>
                  <span>✓</span>Harina para arepas
                </li>
                <li>
                  <span>✓</span>Lo necesario para la semana
                </li>
              </ul>
              <div className="list-stamp">Compra con intención</div>
            </article>
          </div>
          <div className="center-cta">
            <a className="btn" href="#comprar">
              Quiero mi recetario
            </a>
          </div>
        </div>
      </section>

      <section className="pains">
        <div className="wrap">
          <p className="kicker">Si esto te suena</p>
          <h2>El recetario responde justo a eso.</h2>
          <div className="pain-grid pain-grid-short">
            {pains.map((pain) => (
              <article className="card" key={pain.title}>
                <p className="num">{pain.num}</p>
                <h3>{pain.title}</h3>
                <p>{pain.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section band">
        <div className="wrap split">
          <div className="split-photo">
            <Image
              src="/img/mercado.jpg"
              alt="Ingredientes caseros: huevos, auyama, pollo, caraotas"
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="kicker kicker-gold">El mercado del día a día</p>
            <h2>Huevo, pollo, caraota y auyama. Con eso se hace el libro.</h2>
            <p className="lead">
              30 recetas del puesto de siempre. 14 cuando alcanza. Solo 6 de domingo.
              Si el recetario empieza con quinoa, no es para tu cocina.
            </p>
            <a className="btn" href="#comprar">
              Quiero mi recetario
            </a>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="wrap faq-wrap">
          <p className="kicker">Si todavía lo estás pensando</p>
          <h2>Preguntas de verdad</h2>
          <div className="faq">
            {faqs.map((item) => (
              <details key={item.q} open={item.open}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
          <p className="faq-note">
            El pago se valida solo. Cuando queda aprobado, el recetario llega al
            correo y también puedes descargarlo en pantalla.
          </p>
        </div>
      </section>

      <section className="section band final">
        <div className="wrap">
          <div className="final-book">
            <Image
              src="/img/ebook-cover.jpg"
              alt="Portada Mesa Serena"
              width={440}
              height={586}
            />
          </div>
          <h2>El mercado de todos los días. El calendario. Las 50 recetas.</h2>
          <p className="lead">
            {PRODUCT.priceUsd} USD
            {vesLabel ? ` ${vesLabel}` : ""}. PDF al correo cuando el pago quede
            aprobado.
          </p>
          <a className="btn btn-lg" href="#comprar">
            Quiero mi recetario
          </a>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <p>
            <strong>Mesa Serena</strong> — Recetario de comida casera con sabores
            venezolanos para personas con diabetes. Producto digital educativo. No
            diagnostica, no trata y no sustituye atención médica. Pago seguro con
            Skylink Pay.
          </p>
        </div>
      </footer>

      <div className="sticky-cta">
        <span>
          <strong>{PRODUCT.priceUsd} USD</strong>
          <small>Guía digital + menú semanal</small>
        </span>
        <a
          className="wa-mini"
          href={WHATSAPP_URL}
          aria-label="Escribir por WhatsApp"
          title="¿Tienes dudas? Escríbenos por WhatsApp"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.14 1.59 5.95L0 24l6.3-1.65a11.9 11.9 0 0 0 5.76 1.47h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.44-8.44zM12.07 21.3h-.01a9.4 9.4 0 0 1-4.78-1.31l-.34-.2-3.74.98 1-3.64-.22-.37a9.35 9.35 0 0 1-1.43-4.99c0-5.18 4.22-9.4 9.41-9.4 2.51 0 4.87.98 6.64 2.76a9.34 9.34 0 0 1 2.75 6.64c0 5.18-4.22 9.4-9.28 9.53zm5.16-7.03c-.28-.14-1.67-.82-1.93-.91-.26-.1-.45-.14-.64.14-.19.28-.73.91-.9 1.1-.16.19-.33.21-.61.07-.28-.14-1.17-.43-2.23-1.37-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.17.19-.28.28-.47.1-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.35-.26.28-1 .97-1 2.37s1.02 2.75 1.16 2.94c.14.19 2.01 3.07 4.87 4.3.68.29 1.21.47 1.62.6.68.22 1.3.19 1.79.12.55-.08 1.67-.68 1.9-1.34.24-.66.24-1.22.17-1.34-.07-.11-.26-.18-.54-.32z"
            />
          </svg>
        </a>
        <a className="btn" href="#comprar">
          Comprar
        </a>
      </div>

      <a
        className="wa-float"
        href={WHATSAPP_URL}
        aria-label="Escribir por WhatsApp"
        title="¿Tienes dudas? Escríbenos por WhatsApp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.14 1.59 5.95L0 24l6.3-1.65a11.9 11.9 0 0 0 5.76 1.47h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.44-8.44zM12.07 21.3h-.01a9.4 9.4 0 0 1-4.78-1.31l-.34-.2-3.74.98 1-3.64-.22-.37a9.35 9.35 0 0 1-1.43-4.99c0-5.18 4.22-9.4 9.41-9.4 2.51 0 4.87.98 6.64 2.76a9.34 9.34 0 0 1 2.75 6.64c0 5.18-4.22 9.4-9.28 9.53zm5.16-7.03c-.28-.14-1.67-.82-1.93-.91-.26-.1-.45-.14-.64.14-.19.28-.73.91-.9 1.1-.16.19-.33.21-.61.07-.28-.14-1.17-.43-2.23-1.37-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.17.19-.28.28-.47.1-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.35-.26.28-1 .97-1 2.37s1.02 2.75 1.16 2.94c.14.19 2.01 3.07 4.87 4.3.68.29 1.21.47 1.62.6.68.22 1.3.19 1.79.12.55-.08 1.67-.68 1.9-1.34.24-.66.24-1.22.17-1.34-.07-.11-.26-.18-.54-.32z"
          />
        </svg>
        <span className="wa-label">¿Tienes dudas?</span>
      </a>
    </>
  );
}
