import Image from "next/image";
import { CheckoutForm } from "@/components/CheckoutForm";
import { formatVes, PRODUCT } from "@/lib/product";
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
    title: "Me quitaron la arepa",
    text: "No se acabó la arepa. Se acabó la arepa del tamaño de un plato, con jugo y café con azúcar.",
  },
  {
    num: "02",
    title: "Todo lo “light” es caro",
    text: "Quinoa, salmón y galletas importadas. Tú compras pollo, huevo, caraota y auyama.",
  },
  {
    num: "03",
    title: "Como soso y igual se me sube",
    text: "El problema casi nunca es la voluntad. Es cómo se arma el plato criollo.",
  },
  {
    num: "04",
    title: "Cocino para todos y yo aparte",
    text: "Un caldero. Ellos comen rico. Tú tu porción. Sin plato de enferma.",
  },
];

const includes = [
  "50 recetas criollas: desayuno, almuerzo, cena, merienda y domingo",
  "Semáforo venezolano: arepa, yuca, plátano, jugo, papelón",
  "La arepa sin pico: tamaño, relleno y con qué no combinarla",
  "3 menús de 7 días, uno por bolsillo",
  "Lista de mercado para que rinda el real",
  "Sustituciones y antojos sin papelón",
];

const bonuses = [
  ["Semáforo criollo", "Qué sí, qué a veces, qué casi nunca."],
  ["La arepa sin pico", "El ángulo más venezolano, en una guía corta."],
  ["3 menús de 7 días", "Diario, cómodo y elevado. Dime qué cocino mañana."],
  ["Lista de mercado", "Para dejar de improvisar en el mercado."],
  ["Sustituciones", "Papelón, jugo, arroz, harina, plátano maduro."],
  ["Antojos sin castigo", "Porque sin postre el libro se siente dieta."],
];

const faqs = [
  {
    q: "¿Esto me baja la glicemia?",
    a: "No, y desconfía de quien te lo prometa. Mesa Serena es un recetario educativo: te enseña a armar la comida criolla de siempre con mejor criterio — porción, combinación y orden en el plato. Tu médico, endocrino o nutriólogo siguen mandando, y si usas insulina o pastillas, cualquier cambio se habla primero con ellos.",
    open: true,
  },
  {
    q: "¿Tengo que comprar salmón, quinoa o cosas caras?",
    a: "No. De las 50 recetas, 30 son de bolsillo diario — huevo, pollo, caraota, lenteja, sardina, auyama — y 14 de bolsillo cómodo. Solo 6 son de domingo o visita. Si un recetario para Venezuela empieza con quinoa, no fue hecho pensando en tu mercado.",
  },
  {
    q: "¿Mi familia tiene que comer “light” o yo cocino aparte?",
    a: "Ninguna de las dos. Se cocina un solo caldero y todos comen lo mismo, rico. Lo que cambia es cómo armas tu plato: tu porción de arepa, tu parte de proteína y lo que la acompaña. Sin plato de enferma y sin doble cocina.",
  },
  {
    q: "¿Cómo pago y en qué moneda?",
    a: "Pagas en bolívares, al equivalente en dólares a la tasa BCV del día, desde tu banco. Sin Zelle, sin Binance y sin pasarle una captura a nadie por un chat: pagas en la página de pago y listo.",
  },
  {
    q: "¿Cuándo me llega el recetario?",
    a: "Apenas el pago queda aprobado. Te llega un correo con el PDF adjunto y, en la pantalla de gracias que ves al terminar de pagar, también tienes el botón para descargarlo al momento. Si no lo ves en la bandeja, revisa Spam o Promociones: a veces cae ahí.",
  },
  {
    q: "¿Y si no me llega el correo?",
    a: "No te quedas sin libro. La pantalla de gracias tiene la descarga directa, así que lo guardas en tu celular o computadora en ese mismo momento. Y revisa que el correo que escribiste al comprar esté bien: a esa dirección es a donde sale el PDF.",
  },
  {
    q: "¿Es un libro físico? ¿Lo puedo leer en el celular?",
    a: "Es un libro digital en PDF, hecho para leerse cómodo en el celular — que es donde lo vas a consultar, en la cocina. También lo puedes abrir en la computadora o imprimir las páginas que más uses, como los menús de 7 días.",
  },
  {
    q: "¿Se lo puedo comprar a mi mamá o a otra persona?",
    a: "Sí, y es de los regalos que de verdad se usan. Al comprar, escribe el correo de esa persona: el recetario le llega directo a ella, con su nombre. Tú solo pagas.",
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
            <span className="brand-mark" aria-hidden />
            Mesa Serena
          </div>
          <nav className="nav-links">
            <a href="#incluye">El recetario</a>
            <a href="#comprar">Comprar</a>
          </nav>
          <a className="btn" href="#comprar">
            Quiero el recetario — {PRODUCT.priceUsd} USD
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="kicker">Recetario criollo para diabetes</p>
            <h1>
              Te dijeron que se acabó la arepa. <em>Te mintieron a medias.</em>
            </h1>
            <p className="lead">
              Come lo de tu casa —arepa, pabellón, pollo, auyama, caraotas— sin
              vivir con miedo al pico y sin comprar como rico. 50 recetas
              venezolanas, para todos los bolsillos.
            </p>
            <div className="price-row">
              <span className="now">{PRODUCT.priceUsd} USD</span>
              {vesLabel ? <span className="ves">{vesLabel}</span> : null}
            </div>
            <p className="fine">{rateLabel}. Pagas en bolívares con Skylink Pay.</p>
            <div className="hero-actions">
              <a className="btn btn-lg" href="#comprar">
                Comprar el recetario
              </a>
            </div>
            <p className="fine">
              El recetario llega a tu correo cuando el pago quede aprobado.
              Recetario educativo: no sustituye a tu médico.
            </p>
            <div className="hero-meta">
              <span className="chip">50 recetas</span>
              <span className="chip">3 menús de 7 días</span>
              <span className="chip">PDF al correo</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="book-stage">
              <div className="book-glow" />
              <div className="book-shot">
                <Image
                  src="/img/ebook.jpg"
                  alt="Mesa Serena, recetario criollo para diabetes, 50 recetas"
                  width={900}
                  height={1200}
                  priority
                />
              </div>
              <p className="book-caption">El recetario</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pains">
        <div className="wrap">
          <p className="kicker">Si esto te suena, es para ti</p>
          <div className="pain-grid">
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
              alt="Ingredientes del mercado venezolano: huevos, auyama, pollo, caraotas"
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="kicker kicker-gold">Esto no es un recetario de Miami</p>
            <h2>
              30 recetas con lo de tu mercado. 14 cuando alcanza. 6 para el
              domingo.
            </h2>
            <p className="lead">
              Si el recetario empieza con quinoa, no fue hecho para Venezuela.
              Mesa Serena se sienta en las dos mesas: la del día a día y la de
              la visita.
            </p>
            <a className="btn" href="#comprar">
              Quiero el de mi mercado
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="incluye">
        <div className="wrap include">
          <div>
            <p className="kicker">Qué estás comprando</p>
            <h2>No es un PDF suelto. Es el menú de la semana.</h2>
            <p className="lead">
              Por {PRODUCT.priceUsd} dólares
              {vesLabel ? ` (${vesLabel})` : ""} te llega un recetario para dejar
              de improvisar a la hora de comer.
            </p>
            <ul className="clean">
              {includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <aside className="offer" id="comprar">
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
                <p className="kicker">Edición digital</p>
                <h3>Mesa Serena</h3>
              </div>
            </div>
            <CheckoutForm />
          </aside>
        </div>
      </section>

      <section className="section section-tight">
        <div className="wrap">
          <p className="kicker">Para todos los bolsillos</p>
          <h2>El libro no asume que tienes plata</h2>
          <div className="pockets">
            <article className="pocket featured">
              <p className="count">30</p>
              <h3>Diario</h3>
              <p>
                Huevo, pollo, caraota, lenteja, sardina, auyama, arepa pequeña.
                El 80% de tus días.
              </p>
            </article>
            <article className="pocket">
              <p className="count">14</p>
              <h3>Cómodo</h3>
              <p>
                Atún, aguacate, yogurt, cacao, pescado, asado negro sin papelón.
                Cuando el mercado alcanza.
              </p>
            </article>
            <article className="pocket">
              <p className="count">6</p>
              <h3>Elevado</h3>
              <p>
                Quinoa, trucha o salmón, aceite de oliva. Domingo, visita, “me
                lo merezco”.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section band">
        <div className="wrap split">
          <div>
            <p className="kicker kicker-gold">Un caldero para toda la casa</p>
            <h2>
              Tu familia come pabellón. Tú comes el mismo pabellón, en tu
              porción.
            </h2>
            <p className="lead">
              También es el regalo que sí se usa: si tu mamá tiene diabetes, no
              le mandes más audios. Mándale menú.
            </p>
            <a className="btn" href="#comprar">
              Comprar para mamá
            </a>
          </div>
          <div className="split-photo">
            <Image
              src="/img/arepa.jpg"
              alt="Arepa venezolana pequeña con pollo y ensalada"
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <p className="kicker">Bonos, dentro del mismo PDF</p>
          <h2>Lo que viene con el recetario</h2>
          <div className="bonus">
            {bonuses.map(([title, text]) => (
              <article className="card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="wrap faq-wrap">
          <p className="kicker">Si todavía lo estás pensando</p>
          <h2>Preguntas de verdad</h2>
          <p className="lead faq-lead">
            Lo que todo el mundo pregunta antes de pagar, respondido sin
            letra pequeña.
          </p>
          <div className="faq">
            {faqs.map((item) => (
              <details key={item.q} open={item.open}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
          <p className="faq-note">
            Pago aprobado = recetario en tu correo y descarga en pantalla.
            Así de simple.
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
          <h2>Come criollo. Sin pico. Sin comprar como rico.</h2>
          <p className="lead">
            50 recetas. Menú de 7 días. Lista de mercado. {PRODUCT.priceUsd} USD
            {vesLabel ? ` ${vesLabel}` : ""}.
          </p>
          <a className="btn btn-lg" href="#comprar">
            Quiero Mesa Serena
          </a>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <p>
            <strong>Mesa Serena</strong> — Recetario criollo para personas con
            diabetes. Producto digital educativo. No diagnostica, no trata y no
            sustituye atención médica. Pago seguro con Skylink Pay.
          </p>
        </div>
      </footer>

      <div className="sticky-cta">
        <span>
          Mesa Serena · {PRODUCT.priceUsd} USD
          {vesLabel ? ` ${vesLabel}` : ""}
        </span>
        <a className="btn" href="#comprar">
          Comprar
        </a>
      </div>
    </>
  );
}
