"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Purchase = {
  buyOrder: string;
  name: string;
  email: string;
  amountCents: number;
  paidAmountCents?: number;
  status: string;
  delivered: boolean;
  underpaidNotified?: boolean;
  source?: string;
  createdAt: string;
  paidAt?: string;
};

type WebhookEvent = {
  id: string;
  receivedAt: string;
  eventType?: string;
  buyOrder?: string;
  skylinkStatus?: string;
  resultCode?: string;
  resultMessage?: string;
  amountCents?: number;
  paidAmountCents?: number;
  currency?: string;
  decision?: string;
  customerName?: string;
  customerEmail?: string;
  raw: unknown;
};

type AdminData = {
  storage: "neon" | "local";
  databaseConfigured: boolean;
  skylinkTotal?: number;
  skylinkError?: string;
  stats: {
    total: number;
    paid: number;
    delivered: number;
    underpaid: number;
    pending: number;
    revenueCents: number;
    webhookEvents: number;
    skylinkTotal?: number;
  };
  purchases: Purchase[];
  webhookEvents: WebhookEvent[];
};

function bs(cents?: number | null) {
  if (cents === null || cents === undefined) return "—";
  return `${(cents / 100).toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} Bs`;
}

function fecha(iso?: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("es-VE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusLabel: Record<string, string> = {
  paid: "Autorizada",
  underpaid: "En revisión",
  created: "Creada",
  pending: "Pendiente",
  expired: "Expirada",
  cancelled: "Cancelada",
  failed: "Fallida",
};

export default function AdminPanel() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("todas");
  const [saleName, setSaleName] = useState("");
  const [saleEmail, setSaleEmail] = useState("");
  const [salePhone, setSalePhone] = useState("");
  const [saleBusy, setSaleBusy] = useState(false);
  const [saleError, setSaleError] = useState("");
  const [sale, setSale] = useState<{
    url: string;
    buyOrder: string;
    name: string;
    email: string;
    ves: number;
    priceUsd: number;
  } | null>(null);
  const [copied, setCopied] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/purchases", {
        cache: "no-store",
      });
      if (response.status === 401) {
        router.refresh();
        return;
      }
      if (!response.ok) throw new Error("No se pudo cargar el registro.");
      setData((await response.json()) as AdminData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando datos.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [load]);

  async function createSaleLink(event: FormEvent) {
    event.preventDefault();
    setSaleBusy(true);
    setSaleError("");
    setCopied("");
    try {
      const response = await fetch("/api/admin/sale-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: saleName, email: saleEmail }),
      });
      const body = (await response.json()) as {
        message?: string;
        url?: string;
        buyOrder?: string;
        name?: string;
        email?: string;
        ves?: number;
        priceUsd?: number;
      };
      if (!response.ok || !body.url) {
        throw new Error(body.message || "No se pudo crear el enlace.");
      }
      setSale({
        url: body.url,
        buyOrder: body.buyOrder || "",
        name: body.name || saleName.trim(),
        email: body.email || saleEmail.trim(),
        ves: body.ves || 0,
        priceUsd: body.priceUsd || 0,
      });
      await load();
    } catch (err) {
      setSale(null);
      setSaleError(err instanceof Error ? err.message : "No se pudo crear el enlace.");
    } finally {
      setSaleBusy(false);
    }
  }

  function saleMessage(link: NonNullable<typeof sale>) {
    const bolivares = link.ves.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `Hola ${link.name}. Aquí está tu enlace para pagar Mesa Serena (${link.priceUsd} USD, ${bolivares} Bs). Cuando se apruebe el pago, el recetario llega a ${link.email}.\n${link.url}`;
  }

  function saleWhatsappHref(link: NonNullable<typeof sale>) {
    const digits = salePhone.replace(/\D/g, "");
    const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
    return `${base}?text=${encodeURIComponent(saleMessage(link))}`;
  }

  async function copyText(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    router.refresh();
  }

  const purchases = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.purchases.filter((p) => {
      if (filter === "pagadas" && p.status !== "paid") return false;
      if (filter === "entregadas" && !p.delivered) return false;
      if (filter === "incorrectas" && p.status !== "underpaid") return false;
      if (filter === "pendientes" && p.status !== "created" && p.status !== "pending") {
        return false;
      }
      if (filter === "expiradas" && p.status !== "expired") return false;
      if (!q) return true;
      return (
        p.buyOrder.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q)
      );
    });
  }, [data, query, filter]);

  return (
    <div className="admin-panel">
      <header className="admin-head">
        <div>
          <p className="kicker">Panel privado</p>
          <h1>Compras y webhooks</h1>
          <p className="fine">
            El listado sale de Skylink. El nombre y el correo son de la persona
            que creó esa transacción. Se actualiza solo cada 30 segundos.
          </p>
        </div>
        <div className="admin-actions">
          <button className="btn admin-btn-ghost" onClick={load} type="button">
            {loading ? "Cargando…" : "Actualizar"}
          </button>
          <a className="btn admin-btn-ghost" href="/api/admin/purchases?format=csv">
            Exportar CSV
          </a>
          <button className="btn" onClick={logout} type="button">
            Salir
          </button>
        </div>
      </header>

      {data && !data.skylinkTotal && !data.databaseConfigured ? (
        <p className="admin-alert" role="alert">
          ⚠️ Este panel está guardando <strong>solo en este equipo</strong>.
          En producción (Vercel) el disco no guarda nada: conecta la base de
          datos Neon y crea la variable <code>DATABASE_URL</code> para que
          ninguna compra se pierda. Abajo tienes los pasos en el resumen del
          chat.
        </p>
      ) : null}
      {data?.skylinkError ? (
        <p className="admin-alert" role="alert">
          No se pudo leer el listado de transacciones de Skylink: {data.skylinkError}
        </p>
      ) : data?.skylinkTotal ? (
        <p className="admin-ok">
          ✓ {data.skylinkTotal} transacciones leídas de Skylink, cruzadas con
          quien escribió su nombre y su correo al crear el cobro.
        </p>
      ) : null}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      {data ? (
        <>
          <section className="admin-stats" aria-label="Resumen">
            <article>
              <span>{data.stats.paid}</span>
              <p>Ventas pagadas</p>
            </article>
            <article>
              <span>{bs(data.stats.revenueCents)}</span>
              <p>Ingresos registrados</p>
            </article>
            <article>
              <span>{data.stats.delivered}</span>
              <p>Recetarios entregados</p>
            </article>
            <article>
              <span>{data.stats.underpaid}</span>
              <p>En revisión</p>
            </article>
            <article>
              <span>{data.stats.pending}</span>
              <p>Creadas, sin pagar</p>
            </article>
            <article>
              <span>{data.stats.webhookEvents}</span>
              <p>Avisos del webhook</p>
            </article>
          </section>

          <section className="admin-card">
            <h2>Enlace para WhatsApp</h2>
            <p className="fine">
              Escribe el nombre y el correo de quien va a pagar. El enlace cobra
              el precio real, 5 USD en bolívares a la tasa del día. Al aprobarse,
              el recetario se envía solo a ese correo.
            </p>
            <form className="admin-sale" onSubmit={createSaleLink}>
              <label>
                Nombre
                <input
                  value={saleName}
                  onChange={(event) => setSaleName(event.target.value)}
                  placeholder="María Pérez"
                  required
                  minLength={3}
                />
              </label>
              <label>
                Correo del recetario
                <input
                  type="email"
                  value={saleEmail}
                  onChange={(event) => setSaleEmail(event.target.value)}
                  placeholder="maria@correo.com"
                  required
                />
              </label>
              <label>
                WhatsApp (opcional)
                <input
                  value={salePhone}
                  onChange={(event) => setSalePhone(event.target.value)}
                  placeholder="+58 412 000 0000"
                  inputMode="tel"
                />
              </label>
              <button className="btn" type="submit" disabled={saleBusy}>
                {saleBusy ? "Creando…" : "Crear enlace"}
              </button>
            </form>
            {saleError ? (
              <p className="form-error" role="alert">
                {saleError}
              </p>
            ) : null}
            {sale ? (
              <div className="admin-link-box">
                <p>
                  Orden <code>{sale.buyOrder}</code> · el recetario irá a{" "}
                  <strong>{sale.email}</strong>
                </p>
                <p className="admin-link-url">{sale.url}</p>
                <div className="admin-actions">
                  <button
                    className="btn admin-btn-ghost"
                    type="button"
                    onClick={() => copyText("enlace", sale.url)}
                  >
                    {copied === "enlace" ? "Enlace copiado" : "Copiar enlace"}
                  </button>
                  <button
                    className="btn admin-btn-ghost"
                    type="button"
                    onClick={() => copyText("mensaje", saleMessage(sale))}
                  >
                    {copied === "mensaje" ? "Mensaje copiado" : "Copiar mensaje"}
                  </button>
                  <a
                    className="btn"
                    href={saleWhatsappHref(sale)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir WhatsApp
                  </a>
                </div>
              </div>
            ) : null}
          </section>

          <section className="admin-card">
            <div className="admin-tools">
              <h2>Transacciones</h2>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por correo, nombre u orden…"
                aria-label="Buscar compras"
              />
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filtrar compras"
              >
                <option value="todas">Todas</option>
                <option value="pagadas">Autorizadas</option>
                <option value="incorrectas">En revisión</option>
                <option value="pendientes">Creadas</option>
                <option value="expiradas">Expiradas</option>
                <option value="entregadas">Entregadas</option>
              </select>
            </div>

            {purchases.length === 0 ? (
              <p className="fine">
                Todavía no hay compras con ese criterio. Cuando alguien pague,
                aquí verás su nombre, su correo y el monto.
              </p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Orden</th>
                      <th>Quién la creó</th>
                      <th>Correo</th>
                      <th>Esperado</th>
                      <th>Pagó</th>
                      <th>Faltó</th>
                      <th>Estado</th>
                      <th>Entrega</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((p) => (
                      <tr key={p.buyOrder}>
                        <td>{fecha(p.createdAt)}</td>
                        <td>
                          <code>{p.buyOrder}</code>
                        </td>
                        <td>{p.name || "—"}</td>
                        <td>{p.email || "(sin correo)"}</td>
                        <td>{bs(p.amountCents)}</td>
                        <td>{bs(p.paidAmountCents)}</td>
                        <td>
                          {p.paidAmountCents === undefined
                            ? "—"
                            : bs(
                                Math.max(
                                  0,
                                  (p.amountCents || 0) - p.paidAmountCents,
                                ),
                              )}
                        </td>
                        <td>
                          <span
                            className={`admin-badge admin-badge-${p.status}`}
                          >
                            {statusLabel[p.status] ?? p.status}
                          </span>
                        </td>
                        <td>{p.delivered ? "✓ Enviado" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="admin-card">
            <h2>Lo que llegó al webhook</h2>
            <p className="fine">
              Cada aviso de Skylink, con la persona que creó esa transacción:
              su nombre y su correo viajan en el cobro y vuelven en el webhook.
            </p>
            {data.webhookEvents.length === 0 ? (
              <p className="fine">
                Aún no llega ningún aviso. El primero aparecerá en cuanto
                Skylink notifique un pago.
              </p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Llegó</th>
                      <th>Evento</th>
                      <th>Orden</th>
                      <th>Quién la creó</th>
                      <th>Correo</th>
                      <th>Estado Skylink</th>
                      <th>Código</th>
                      <th>Esperado</th>
                      <th>Pagó</th>
                      <th>Decisión</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.webhookEvents.map((e) => (
                      <tr key={e.id}>
                        <td>{fecha(e.receivedAt)}</td>
                        <td>{e.eventType || "—"}</td>
                        <td>
                          <code>{e.buyOrder || "—"}</code>
                        </td>
                        <td>{e.customerName || "—"}</td>
                        <td>{e.customerEmail || "(sin correo)"}</td>
                        <td>{e.skylinkStatus || "—"}</td>
                        <td>{e.resultCode || "—"}</td>
                        <td>{bs(e.amountCents)}</td>
                        <td>{bs(e.paidAmountCents)}</td>
                        <td>
                          <span
                            className={`admin-badge admin-badge-${e.decision ?? "pending"}`}
                          >
                            {e.decision === "approved"
                              ? "Aprobado"
                              : e.decision === "underpaid"
                                ? "Monto incorrecto"
                                : e.decision === "invalid"
                                  ? "Inválido"
                                  : "Pendiente"}
                          </span>
                        </td>
                        <td>
                          <details className="admin-raw">
                            <summary>Ver</summary>
                            <pre>
                              {JSON.stringify(e.raw ?? {}, null, 2)}
                            </pre>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : (
        !error && <p className="fine">Cargando compras…</p>
      )}
    </div>
  );
}
