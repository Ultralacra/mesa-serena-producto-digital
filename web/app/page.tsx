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
    text: "La arepa se queda. Lo que se acaba es la del tamaño de un plato, con jugo y café con azúcar. Comes arepa. Sin que se te dispare.",
  },
  {
    num: "02",
    title: "Como soso y igual se me sube",
    text: "Ya dejaste el azúcar y el arroz, y el glucometro no perdona. Casi nunca es falta de voluntad: es cómo se arma el plato.",
  },
  {
    num: "03",
    title: "Lo “light” no está en mi mercado",
    text: "Quinoa, salmón y galletas importadas. Tú compras pollo, huevo, caraota y auyama. Con eso se cocina este libro.",
  },
  {
    num: "04",
    title: "Cocino para todos y yo como aparte",
    text: "Un caldero para la casa y otro plato para ti, el de enferma. Aquí se cocina una vez: ellos comen, tú comes tu porción.",
  },
];

const includes = [
  "50 recetas criollas: desayuno, almuerzo, cena, merienda y el domingo",
  "La arepa, en su punto: el tamaño, el relleno y con qué no la acompañas para que no se te suba",
  "Semáforo venezolano: arepa, yuca, plátano, jugo y papelón, dicho claro",
  "3 menús de 7 días, uno para cada bolsillo",
  "Lista de mercado para que rinda el real de la semana",
  "Sustituciones y antojos, para la visita y el domingo",
];

const bonuses = [
  ["La arepa, en su punto", "Tamaño, relleno y con qué no la acompañas para que no se te suba. La guía corta con la que abre el libro."],
  ["Semáforo criollo", "Qué comes tranquila, qué dejas para a veces y qué casi nunca. Para dejar de adivinar."],
  ["3 menús de 7 días", "Diario, cómodo y de domingo. Para no preguntarte a las once qué se almuerza."],
  ["Lista de mercado", "Lo que compras esta semana, con lo que sí se consigue y rinde."],
  ["Sustituciones", "Papelón, jugo, arroz, harina y plátano maduro: con qué los cambias sin perder el plato."],
  ["Antojos sin castigo", "El domingo y el postre también están. Si no, el libro se siente dieta."],
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
    a: "Ninguna de las dos. Se cocina un solo caldero y todos comen lo mismo, rico. Lo que cambia es tu plato: la arepa más pequeña, tu parte de proteína y lo que va al lado. Comes lo mismo que ellos, sin que se te dispare. Sin plato de enferma y sin cocinar dos veces.",
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
            Quiero mi recetario — {PRODUCT.priceUsd} USD
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="kicker">Para la que cocina todos los días</p>
            <h1>
              Te dijeron que se acabó la arepa. <em>Te mintieron a medias.</em>
            </h1>
            <p className="lead">
              Eres la que pone el almuerzo. El diagnóstico —el tuyo, el de tu
              esposo o el de tu mamá— te dejó con miedo de mirar el glucometro.
              Mesa Serena es el recetario para seguir comiendo lo de tu casa
              —arepa, pabellón, pollo, caraota y auyama— sin que se te
              dispare y sin comprar como rico. 50 recetas, para el bolsillo
              de entre semana.
            </p>
            <div className="price-row">
              <span className="now">{PRODUCT.priceUsd} USD</span>
              {vesLabel ? <span className="ves">{vesLabel}</span> : null}
            </div>
            <p className="fine">{rateLabel}. Pagas en bolívares con Skylink Pay.</p>
            <div className="hero-actions">
              <a className="btn btn-lg" href="#comprar">
                Quiero mi recetario
              </a>
            </div>
            <p className="fine">
              Tu recetario llega directo a tu correo cuando el pago quede
              aprobado. Recetario educativo: no sustituye a tu médico.
            </p>
            <div className="hero-meta">
              <span className="chip">50 recetas criollas</span>
              <span className="chip">Menú de 7 días</span>
              <span className="chip">Sin que se te dispare</span>
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
          <p className="kicker">Si cocinas y te suena, es para ti</p>
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
              Si el recetario empieza con quinoa, no lo escribieron para tu
              cocina. El tuyo se sienta en las dos mesas que sí tienes: la del
              martes, con lo que rindió el mercado, y la del domingo, cuando
              viene visita.
            </p>
            <a className="btn" href="#comprar">
              Quiero mi recetario
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="incluye">
        <div className="wrap include">
          <div>
            <p className="kicker">Qué te llevas</p>
            <h2>No es una lista de “ya no puedes”. Es el menú de tu semana.</h2>
            <p className="lead">
              Por {PRODUCT.priceUsd} dólares
              {vesLabel ? ` (${vesLabel})` : ""} dejas de improvisar a la hora
              de comer, con la comida que ya sabes hacer.
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
          <h2>Cocinas con lo que hay, no con lo que está de moda</h2>
          <div className="pockets">
            <article className="pocket featured">
              <p className="count">30</p>
              <h3>Diario</h3>
              <p>
                Huevo, pollo, caraota, lenteja, sardina, auyama y arepa
                pequeña. El 80% de tus días, con lo del mercado de siempre.
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
              Ellos comen pabellón. Tú comes el mismo pabellón, en tu porción.
            </h2>
            <p className="lead">
              Un solo caldero. La arepa más pequeña, tu parte de la carne y la
              caraota, y la ensalada que acompaña. Sin plato de enferma.
            </p>
            <p className="lead">
              Y si quien cocina no eres tú, sino tu mamá: cómpraselo a su
              correo. Le llega el recetario con su nombre. Tú pagas. Es el
              regalo que sí se usa, mejor que otro audio de “cuídate”.
            </p>
            <a className="btn" href="#comprar">
              Quiero mi recetario
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
          <p className="kicker">Dentro del mismo recetario</p>
          <h2>Las guías para no volver a improvisar</h2>
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
            Lo que preguntas tú, la que cocina, antes de pagar. Sin letra
            pequeña y sin promesas de médico.
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
          <h2>Come lo de tu casa. Sin que se te dispare. Sin comprar como rico.</h2>
          <p className="lead">
            50 recetas con lo de tu mercado. El menú de tu semana. La lista
            para no improvisar. {PRODUCT.priceUsd} USD
            {vesLabel ? ` ${vesLabel}` : ""}.
          </p>
          <a className="btn btn-lg" href="#comprar">
            Quiero mi recetario
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
          Quiero mi recetario
        </a>
      </div>
    </>
  );
}
