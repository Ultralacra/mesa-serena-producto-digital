"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Status = {
  paid?: boolean;
  status?: string;
  message?: string;
  delivered?: boolean;
  deliveryError?: string;
  order?: { name: string; email: string; buyOrder: string } | null;
};

export function ReturnView({
  token,
  buyOrder,
  downloadUrl,
}: {
  token: string;
  buyOrder: string;
  downloadUrl: string;
}) {
  const [data, setData] = useState<Status>({});
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    let stop = false;
    const query = new URLSearchParams({ token, buyOrder });
    console.log("[MESA] USUARIO · volvió a /gracias", { token, buyOrder });

    async function tick(attempt: number) {
      if (stop) return;
      try {
        const res = await fetch(`/api/checkout/status?${query.toString()}`);
        const payload = (await res.json()) as Status;
        console.log("[MESA] USUARIO · estado del pago", { attempt, payload });
        if (stop) return;
        setData(payload);
        if (payload.paid) {
          setLoading(false);
          return;
        }
      } catch {
        if (!stop) setData({ message: "No se pudo confirmar el pago." });
      }
      if (attempt >= 40) {
        setLoading(false);
        return;
      }
      setTimeout(() => void tick(attempt + 1), 3000);
    }

    void tick(1);
    return () => {
      stop = true;
    };
  }, [token, buyOrder]);

  const rawName = data.order?.name?.trim().split(/\s+/)[0] ?? "";
  const name = rawName
    ? rawName.charAt(0).toUpperCase() + rawName.slice(1)
    : "";
  const email = data.order?.email;

  return (
    <main className="thanks">
      <p className="thanks-brand">
        <span className="brand-mark" aria-hidden />
        Mesa Serena
      </p>

      <div className="thanks-grid">
        <div className="thanks-book">
          <Image
            src="/img/ebook-cover.jpg"
            alt="Portada de Mesa Serena"
            width={640}
            height={853}
            priority
            style={{ width: "100%", height: "auto" }}
          />
        </div>

        <div className="thanks-copy">
          {loading ? (
            <>
              <p className="kicker">Un momento</p>
              <h1>Confirmando tu pago…</h1>
              <p className="lead">
                Skylink está cerrando el cobro. Esta página se actualiza sola.
              </p>
            </>
          ) : data.paid ? (
            <>
              <p className="kicker">Pago aprobado</p>
              <h1>
                Gracias{name ? `, ${name.split(" ")[0]}` : ""}.{" "}
                <em>Ya es tuyo.</em>
              </h1>
              <p className="lead">
                El recetario va en camino
                {email ? (
                  <>
                    {" "}
                    a <strong>{email}</strong>
                  </>
                ) : (
                  " a tu correo"
                )}
                . El PDF va adjunto y, si no abre, lo descargas aquí.
              </p>
              {data.deliveryError ? (
                <p className="form-error">
                  El pago está bien. El correo se reintenta: {data.deliveryError}
                </p>
              ) : null}
              <div className="thanks-actions">
                <a className="btn btn-lg" href={downloadUrl}>
                  Descargar el recetario
                </a>
                <a className="thanks-link" href="/">
                  Volver al inicio
                </a>
              </div>
              <ol className="thanks-steps">
                <li>
                  <span>01</span>
                  <p>Revisa la bandeja y también Spam o Promociones.</p>
                </li>
                <li>
                  <span>02</span>
                  <p>Abre el PDF adjunto o usa el botón de descarga.</p>
                </li>
                <li>
                  <span>03</span>
                  <p>Empieza por la receta 01. El domingo, elige un menú.</p>
                </li>
              </ol>
            </>
          ) : (
            <>
              <p className="kicker">Casi</p>
              <h1>Aún no vemos el cobro.</h1>
              <p className="lead">
                {data.message ||
                  "Si acabas de pagar, espera unos segundos. Si el banco rechazó el pago, vuelve a intentarlo."}
              </p>
              <div className="thanks-actions">
                <a className="btn" href="/#comprar">
                  Volver a pagar
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
