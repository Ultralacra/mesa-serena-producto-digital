import Image from "next/image";
import { CheckoutForm } from "@/components/CheckoutForm";
import { LaunchCountdown } from "@/components/LaunchCountdown";
import {
  formatVes,
  isLaunchOfferActive,
  OFFER,
  PRODUCT,
} from "@/lib/product";
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

const heroBullets = [
  "50 recetas con huevo, pollo, caraota y auyama",
  "Menú de 7 días ya armado + lista de mercado",
  "Pagas en Bs · se valida solo · llega al correo",
];

const includes = [
  "Calendario de 7 días (desayuno, almuerzo, merienda y cena)",
  "50 recetas del mercado venezolano, no de quinoa importada",
  "Tips: arepa en su punto, semáforo y sustituciones",
  "Lista de mercado de la semana",
  "Un solo caldero: la familia come lo mismo, tú tu porción",
];

const trust = [
  {
    title: "Pago directo desde tu banco",
    text: "En bolívares, a la tasa BCV del día. No mandas capturas por chat ni esperas que alguien confirme a mano: el sistema valida el pago solo.",
  },
  {
    title: "Lo recibes en el momento",
    text: "Al quedar aprobado, el recetario sale a tu correo y además lo descargas ahí mismo en pantalla. No queda nada pendiente.",
  },
  {
    title: "Hecho para el mercado de aquí",
    text: "Huevo, pollo, caraota, auyama y arepa. 30 de las 50 recetas salen del puesto de todos los días; nada de quinoa ni salmón.",
  },
  {
    title: "Educativo, sin promesas falsas",
    text: "No te prometemos bajar la glicemia ni dejar la pastilla. Te damos el plato armado. Tu médico sigue mandando.",
  },
];

const faqs = [
  {
    q: "¿Qué estoy comprando exactamente?",
    a: "Una guía digital completa — no un archivo suelto: 50 recetas caseras, menú de 7 días, lista de mercado y guías prácticas. La abres en el celular en la cocina.",
    open: true,
  },
  {
    q: "¿Por qué veo 7 USD tachados?",
    a: "El precio de referencia es 7 USD. Hoy, en lanzamiento, lo dejas en 5 USD. Cuando cierre el lanzamiento, vuelve el precio habitual.",
  },
  {
    q: "¿Cómo pago?",
    a: "En bolívares a tasa BCV, desde tu banco. El pago se valida automáticamente: sin Zelle, sin Binance y sin mandar capturas por chat.",
  },
  {
    q: "¿Cuándo me llega?",
    a: "En cuanto el sistema valida el pago (es automático). Correo + descarga en la pantalla de gracias.",
  },
  {
    q: "¿Esto me baja la glicemia?",
    a: "No, y desconfía de quien te lo prometa. Es un recetario educativo. Tu médico sigue mandando.",
  },
];

export default async function Home() {
  const quote = await priceQuote();
  const vesLabel = quote ? `≈ ${formatVes(quote.ves)} Bs` : "";
  const launch = isLaunchOfferActive();

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
            <a href="#incluye">Qué incluye</a>
            <a href="#comprar">Comprar</a>
          </nav>
          <a className="btn" href="#comprar">
            Comprar — {PRODUCT.priceUsd} USD
          </a>
        </div>
      </header>

      <section className="hero hero-buy">
        <div className="wrap hero-buy-grid">
          <div className="hero-copy">
            <p className="kicker">Mesa Serena · recetario digital</p>
            <h1>
              Comida criolla con diabetes.{" "}
              <em>Menú de 7 días, sin improvisar.</em>
            </h1>
            <p className="lead">
              Guía digital para tu cocina: 50 recetas con lo del mercado
              venezolano. No es dieta de Miami. No es un archivo suelto.
            </p>
            <ul className="hero-bullets">
              {heroBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {launch ? (
              <p className="offer-tag">
                {OFFER.label} de hoy: <s>{OFFER.compareAtUsd} USD</s> →{" "}
                {PRODUCT.priceUsd} USD
              </p>
            ) : null}
            <div className="price-row">
              {launch ? <span className="was">{OFFER.compareAtUsd} USD</span> : null}
              <span className="now">{PRODUCT.priceUsd} USD</span>
              {vesLabel ? <span className="ves">{vesLabel}</span> : null}
            </div>
            {vesLabel ? (
              <p className="ves-big hero-ves">
                Hoy son <strong>{vesLabel.replace("≈ ", "")}</strong>
              </p>
            ) : null}
            {launch ? <LaunchCountdown endsAtIso={OFFER.endsAtIso} /> : null}
            <div className="hero-actions">
              <a className="btn btn-lg" href="#comprar">
                Quiero mi recetario ahora
              </a>
            </div>
            <p className="fine">
              Educativo: acompaña, no reemplaza, a tu médico.
            </p>
          </div>

          <aside className="offer" id="comprar">
            <div className="offer-ribbon">
              {launch
                ? `Hoy · ${OFFER.compareAtUsd} → ${PRODUCT.priceUsd} USD · llega al correo`
                : "Pago automático · llega al correo"}
            </div>
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
                <p className="kicker">Compra ahora</p>
                <h3>Mesa Serena</h3>
                <p className="fine">
                  Menú + 50 recetas + lista. En menos de 1 minuto en tu correo.
                </p>
              </div>
            </div>
            <CheckoutForm />
          </aside>
        </div>
      </section>

      <section className="proof-strip" aria-label="Lo que recibes">
        <div className="wrap proof-grid">
          <div>
            <strong>{PRODUCT.priceUsd} USD</strong>
            <span>{launch ? "lanzamiento hoy" : "precio claro"}</span>
          </div>
          <div>
            <strong>50</strong>
            <span>recetas caseras</span>
          </div>
          <div>
            <strong>7 días</strong>
            <span>menú resuelto</span>
          </div>
          <div>
            <strong>1 min</strong>
            <span>al correo</span>
          </div>
        </div>
      </section>

      <section className="section buy-early" id="incluye">
        <div className="wrap include include-after">
          <div>
            <p className="kicker">Qué te llevas</p>
            <h2>La semana resuelta, con lo de tu nevera.</h2>
            <p className="lead">
              Arepa, pabellón, pollo, caraota. Un solo caldero. Tú comes tu
              porción — sin plato de enferma y sin quinoa.
            </p>
            <ul className="clean">
              {includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="hero-food include-photo">
              <Image
                className="hero-food-photo"
                src="/img/arepa.jpg"
                alt="Arepa casera con pollo y ensalada — Mesa Serena"
                width={900}
                height={700}
              />
              <p className="hero-food-caption">
                Arepa sí. Más pequeña. Mejor acompañada.
              </p>
            </div>
          </div>
          <div className="trust-list" aria-label="Por qué puedes comprar con tranquilidad">
            {trust.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
            <a className="btn" href="#comprar">
              Comprar ahora — {PRODUCT.priceUsd} USD
            </a>
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
            <p className="kicker kicker-gold">Mercado de todos los días</p>
            <h2>Huevo, pollo, caraota y auyama. Con eso se hace el libro.</h2>
            <p className="lead">
              30 recetas del puesto de siempre. Si el recetario empieza con
              quinoa, no es para tu cocina.
            </p>
            <a className="btn" href="#comprar">
              Quiero mi recetario
            </a>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="wrap faq-wrap">
          <p className="kicker">Antes de pagar</p>
          <h2>Preguntas claras</h2>
          <div className="faq">
            {faqs.map((item) => (
              <details key={item.q} open={item.open}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
          <p className="faq-note">
            El pago se valida solo. Recetario al correo + descarga en pantalla.
          </p>
          <div className="center-cta">
            <a className="btn btn-lg" href="#comprar">
              Pagar ahora — {PRODUCT.priceUsd} USD
            </a>
            <a
              className="btn btn-wa hero-wa"
              href="#comprar"
              target="_blank"
              rel="noopener noreferrer"
            >
              Preferir WhatsApp
            </a>
          </div>
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
          <h2>Menú. 50 recetas. Lista de mercado. Hoy.</h2>
          <p className="lead">
            {launch ? (
              <>
                <s>{OFFER.compareAtUsd} USD</s> {PRODUCT.priceUsd} USD
              </>
            ) : (
              <>{PRODUCT.priceUsd} USD</>
            )}
            {vesLabel ? ` ${vesLabel}` : ""}. En menos de 1 minuto en tu correo.
          </p>
          <a className="btn btn-lg" href="#comprar">
            Quiero mi recetario ahora
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
          <strong>
            {launch ? (
              <>
                <span className="sticky-was">{OFFER.compareAtUsd}</span>{" "}
                {PRODUCT.priceUsd} USD
              </>
            ) : (
              <>{PRODUCT.priceUsd} USD</>
            )}
          </strong>
          <small>{vesLabel ? `${vesLabel} · ` : ""}llega en 1 min</small>
        </span>
        <a
          className="wa-mini"
          href="#comprar"
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
          Pagar
        </a>
      </div>

      <a
        className="wa-float"
        href="#comprar"
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
        <span className="wa-label">WhatsApp</span>
      </a>
    </>
  );
}
