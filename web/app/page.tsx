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
  {
    num: "04",
    title: "El miedo después de comer",
    text: "Ese rato en el que no quieres mirar el glucometro. El libro no te promete un número: te arma el plato para que ese rato pese menos.",
  },
  {
    num: "05",
    title: "El desayuno te arma el día",
    text: "No es el pabellón del domingo. Es el lunes: arepa enorme, jugo y café con azúcar. Hay 10 desayunos criollos para cortar eso.",
  },
  {
    num: "06",
    title: "Para tu mamá, sin sermón",
    text: "Si ella es la que cocina, cómpraselo a su correo. Le llega el recetario con su nombre. Tú pagas. Mejor que otro audio de “cuídate”.",
  },
  {
    num: "07",
    title: "El domingo también se come",
    text: "Pabellón, asado y visita no son el enemigo. El plato montado hasta arriba sí. Hay versión de domingo, con lo que de verdad se sirve en casa.",
  },
  {
    num: "08",
    title: "Comes soso y sigues con miedo",
    text: "Ya quitaste el azúcar y el arroz, y igual dudas. No es falta de voluntad. Nadie te enseñó a armar el plato criollo.",
  },
  {
    num: "09",
    title: "El antojo, sin papelón",
    text: "Diabetes no es vivir sin postre. Es vivir sin papelón a lo loco. Hay meriendas y un postre de lechosa para cuando el cuerpo pide dulce.",
  },
];

const week = [
  ["Lunes", "Perico y arepa pequeña", "Pabellón", "Caldo de pollo"],
  ["Martes", "Avena de canela", "Pollo con auyama", "Sardinas con pepino"],
  ["Miércoles", "Huevos con espinaca", "Lentejas y huevo", "Huevos al plato"],
  ["Jueves", "Café, huevo y tomate", "Caraotas y ensalada", "Crema de auyama"],
  ["Viernes", "Omelette de ají", "Pollo saltado", "Vegetales y huevo"],
  ["Sábado", "Arepa de auyama con pollo", "Hervido liviano", "Ensalada de lentejas"],
  ["Domingo", "Panqueques de avena", "Pescado al horno", "Wrap de lechuga"],
];

const recipeBlocks = [
  ["10 desayunos", "Perico, arepa de auyama, avena de canela, huevos con espinaca."],
  ["18 almuerzos", "Pabellón, caraotas, pollo con auyama, lentejas, hervido."],
  ["10 cenas", "Caldo de pollo, crema de auyama, sardinas, huevos al plato."],
  ["8 meriendas", "Tostones al horno, pepino con limón, café con canela."],
  ["4 de domingo", "Asado sin papelón, pollo brasa, postre de lechosa."],
];

const tips = [
  ["El calendario", "Lunes a domingo ya armado: desayuno, almuerzo, merienda y cena. No tienes que inventar el día."],
  ["La arepa, en su punto", "Del tamaño de la palma, con pollo o huevo adentro y ensalada al lado. Se queda en la mesa."],
  ["El semáforo", "Arepa, yuca, plátano, jugo y papelón: qué comes tranquila, qué dejas para a veces y qué casi nunca."],
  ["La lista del mercado", "Huevos, pollo, caraotas, auyama, harina. Lo que está en el puesto de todos los días, no en una tienda de importados."],
];
const includes = [
  "El calendario de 7 días, con desayuno, almuerzo, merienda y cena ya escritos",
  "50 recetas con el mercado del día a día: huevo, pollo, caraota, lenteja, sardina y auyama",
  "Los tips: semáforo, la arepa en su punto, y con qué cambias el papelón, el jugo y el arroz",
  "La lista de mercado de la semana, para no pasear el puesto adivinando",
  "30 platos de todos los días, 14 para cuando alcanza y 6 de domingo",
  "Un solo caldero: la casa come lo mismo, tú comes tu porción",
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
            <p className="kicker">Para la que cocina y carga con el miedo</p>
            <h1>
              Con diabetes no se acaba la comida criolla. <em>Se acaba la improvisación.</em>
            </h1>
            <p className="lead">
              Mesa Serena te devuelve una respuesta para cada comida: el
              calendario de 7 días, 50 recetas criollas y las guías para armar
              tu plato sin vivir pensando en el pico. Con huevo, pollo, caraota,
              lenteja, sardina y auyama. Con lo que sí se consigue.
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
              aprobado. Es educativo y acompaña, no reemplaza, a tu médico.
            </p>
            <div className="hero-meta">
              <span className="chip">50 recetas criollas</span>
              <span className="chip">Menú de 7 días</span>
              <span className="chip">Lista de mercado</span>
              <span className="chip">Para toda la familia</span>
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

      <section className="loot" id="incluye">
        <div className="wrap">
          <p className="kicker">No compras otro PDF de recetas</p>
          <h2>Compras la semana resuelta y la calma de saber qué cocinar.</h2>
          <p className="lead loot-lead">
            No más abrir la nevera a las once y pensar “¿y ahora qué hago?”.
            Aquí encuentras qué comer, qué comprar y cómo servirlo con lo que
            ya forma parte de tu cocina.
          </p>

          <div className="loot-grid">
            <article className="card loot-calendar">
              <p className="kicker">El calendario</p>
              <h3>Tu semana deja de ser una pregunta</h3>
              <div className="week" role="table" aria-label="Menú de 7 días con el mercado del día a día">
                <div className="week-head" role="row">
                  <span>Día</span>
                  <span>Desayuno</span>
                  <span>Almuerzo</span>
                  <span>Cena</span>
                </div>
                {week.map(([day, breakfast, lunch, dinner]) => (
                  <div className="week-row" role="row" key={day}>
                    <strong>{day}</strong>
                    <span>{breakfast}</span>
                    <span>{lunch}</span>
                    <span>{dinner}</span>
                  </div>
                ))}
              </div>
              <p className="fine">Hay un menú diario, otro para cuando el mercado alcanza y uno para el domingo.</p>
            </article>

            <div className="loot-side">
              <article className="card">
                <p className="kicker">Las recetas</p>
                <h3>50 platos que ya sabes comprar</h3>
                <ul className="loot-list">
                  {recipeBlocks.map(([title, text]) => (
                    <li key={title}>
                      <strong>{title}</strong>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="card">
                <p className="kicker">Los tips</p>
                <h3>Para no improvisar en la cocina</h3>
                <ul className="loot-list">
                  {tips.map(([title, text]) => (
                    <li key={title}>
                      <strong>{title}</strong>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
          <div className="loot-cta">
            <a className="btn" href="#comprar">
              Quiero mi recetario
            </a>
          </div>
        </div>
      </section>

      <section className="pains">
        <div className="wrap">
          <p className="kicker">Nueve formas de llegar hasta aquí</p>
          <h2>Una de estas es la tuya. El recetario responde las nueve.</h2>
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
            <p className="kicker kicker-gold">El mercado del día a día</p>
            <h2>Huevo, pollo, caraota y auyama. Con eso se hace el libro.</h2>
            <p className="lead">
              30 recetas son del puesto de siempre. 14 entran cuando alcanza el
              atún o el aguacate. Solo 6 piden algo de domingo. Si el recetario
              empieza con quinoa, no es para tu cocina.
            </p>
            <a className="btn" href="#comprar">
              Quiero mi recetario
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="comprar-wrap">
        <div className="wrap include">
          <div>
            <p className="kicker">Qué te llevas</p>
            <h2>El menú de la semana, con lo que ya está en la nevera.</h2>
            <p className="lead">
              Por {PRODUCT.priceUsd} dólares
              {vesLabel ? ` (${vesLabel})` : ""} dejas de improvisar cada día.
              La respuesta sale del mercado que conoces, no de una lista de
              ingredientes imposibles.
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
                <p className="kicker">Tu guía para la mesa</p>
                <h3>Mesa Serena</h3>
                <p className="fine">Un solo PDF. 50 recetas y 6 guías prácticas.</p>
              </div>
            </div>
            <CheckoutForm />
          </aside>
        </div>
      </section>

      <section className="section section-tight">
        <div className="wrap">
          <p className="kicker">Para todos los bolsillos</p>
          <h2>Cocinas con el mercado del día a día</h2>
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
          <h2>El mercado de todos los días. El calendario. Las 50 recetas.</h2>
          <p className="lead">
            Huevo, pollo, caraota y auyama. La semana ya armada. Los tips para
            no improvisar. {PRODUCT.priceUsd} USD
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

      <a
        className="wa-float"
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.14 1.59 5.95L0 24l6.3-1.65a11.9 11.9 0 0 0 5.76 1.47h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.44-8.44zM12.07 21.3h-.01a9.4 9.4 0 0 1-4.78-1.31l-.34-.2-3.74.98 1-3.64-.22-.37a9.35 9.35 0 0 1-1.43-4.99c0-5.18 4.22-9.4 9.41-9.4 2.51 0 4.87.98 6.64 2.76a9.34 9.34 0 0 1 2.75 6.64c0 5.18-4.22 9.4-9.28 9.53zm5.16-7.03c-.28-.14-1.67-.82-1.93-.91-.26-.1-.45-.14-.64.14-.19.28-.73.91-.9 1.1-.16.19-.33.21-.61.07-.28-.14-1.17-.43-2.23-1.37-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.17.19-.28.28-.47.1-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.35-.26.28-1 .97-1 2.37s1.02 2.75 1.16 2.94c.14.19 2.01 3.07 4.87 4.3.68.29 1.21.47 1.62.6.68.22 1.3.19 1.79.12.55-.08 1.67-.68 1.9-1.34.24-.66.24-1.22.17-1.34-.07-.11-.26-.18-.54-.32z"
          />
        </svg>
        Quiero mi recetario
      </a>
    </>
  );
}
