"use client";

import { useEffect, useState, type FormEvent } from "react";
import { formatVes, PRODUCT } from "@/lib/product";

type Quote = {
  rate?: number;
  equivalentVes?: number;
  message?: string;
};

export function CheckoutForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [quote, setQuote] = useState<Quote>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/rate")
      .then((res) => res.json())
      .then((data: Quote) => setQuote(data))
      .catch(() => setQuote({ message: "No se pudo leer la tasa BCV." }));
  }, []);

  async function pay(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    console.log("[MESA] USUARIO · clic en Pagar", {
      nombre: name.trim(),
      correo: email.trim(),
    });
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim() }),
    });
    const payload = (await response.json()) as {
      message?: string;
      url?: string;
      buyOrder?: string;
      token?: string;
    };
    if (!response.ok || !payload.url) {
      console.log("[MESA] USUARIO · checkout falló", payload);
      setSaving(false);
      setError(payload.message || "No se pudo abrir Skylink Pay.");
      return;
    }
    console.log("[MESA] USUARIO · va a Skylink Pay", payload);
    window.location.assign(payload.url);
  }

  return (
    <form className="checkout" onSubmit={pay}>
      <p>Recetario + 6 guías. Un archivo, al correo cuando el pago quede aprobado.</p>
      <div className="price-row">
        <span className="now">{PRODUCT.priceUsd} USD</span>
        {quote.equivalentVes ? (
          <span className="ves">≈ {formatVes(quote.equivalentVes)} Bs</span>
        ) : null}
      </div>
      <p className="fine">
        {quote.rate
          ? `Tasa BCV ${formatVes(quote.rate)} · pagas en bolívares con Skylink Pay.`
          : quote.message || "Precio en bolívares a tasa BCV al pagar."}
      </p>
      <p className="fine">Cobro de prueba ahora: {PRODUCT.testVes} Bs.</p>
      <label>
        Nombre
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
          minLength={3}
        />
      </label>
      <label>
        Correo
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="btn btn-lg" type="submit" disabled={saving}>
        {saving ? "Abriendo Skylink Pay…" : "Pagar con Skylink Pay"}
      </button>
      <p className="fine">El recetario llega a este correo cuando el cobro quede aprobado.</p>
    </form>
  );
}
