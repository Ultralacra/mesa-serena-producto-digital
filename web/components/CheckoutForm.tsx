"use client";

import { useEffect, useState, type FormEvent } from "react";
import { normalizeEmail, validateEmail } from "@/lib/email";
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
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  useEffect(() => {
    fetch("/api/rate")
      .then((res) => res.json())
      .then((data: Quote) => setQuote(data))
      .catch(() => setQuote({ message: "No se pudo leer la tasa BCV." }));
  }, []);

  const emailCheck = validateEmail(email);
  const emailOk = emailTouched && email.trim() !== "" && emailCheck.error === "";
  const payLabel = quote.equivalentVes
    ? `Pagar ≈ ${formatVes(quote.equivalentVes)} Bs`
    : `Pagar ${PRODUCT.priceUsd} USD`;

  function checkName(value: string) {
    const message = value.trim().length >= 3 ? "" : "Escribe tu nombre, aunque sea solo el primero.";
    setNameError(message);
    return message === "";
  }

  function checkEmail(value: string) {
    const message = validateEmail(value).error;
    setEmailError(message);
    return message === "";
  }

  async function pay(event: FormEvent) {
    event.preventDefault();
    setError("");
    const nameOk = checkName(name);
    const mailOk = checkEmail(email);
    setEmailTouched(true);
    if (!nameOk || !mailOk) {
      document.getElementById(nameOk ? "checkout-email" : "checkout-name")?.focus();
      return;
    }

    const cleanEmail = normalizeEmail(email);
    setSaving(true);
    console.log("[MESA] USUARIO · clic en Quiero mi recetario", {
      nombre: name.trim(),
      correo: cleanEmail,
    });
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: cleanEmail }),
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
        setError(payload.message || "No se pudo abrir el pago. Inténtalo de nuevo.");
        return;
      }
      console.log("[MESA] USUARIO · va a pagar", payload);
      window.location.assign(payload.url);
    } catch {
      setSaving(false);
      setError("No se pudo abrir el pago. Revisa tu conexión e inténtalo de nuevo.");
    }
  }

  return (
    <form className="checkout" onSubmit={pay} noValidate>
      <p>
        Empieza por tu próxima comida. Al aprobarse el pago, recibes el
        recetario directamente en este correo.
      </p>
      <div className="price-row">
        <span className="now">{PRODUCT.priceUsd} USD</span>
        {quote.equivalentVes ? (
          <span className="ves">≈ {formatVes(quote.equivalentVes)} Bs</span>
        ) : null}
      </div>
      <p className="fine">
        {quote.rate
          ? `Tasa BCV ${formatVes(quote.rate)} · pagas en bolívares.`
          : quote.message || "Precio en bolívares a tasa BCV al pagar."}
      </p>
      {quote.equivalentVes ? (
        <p className="fine">
          Hoy son <strong>{formatVes(quote.equivalentVes)} Bs</strong>. Ese es el
          monto exacto a pagar.
        </p>
      ) : null}

      <ol className="pay-steps" aria-label="Cómo pagar">
        <li>
          <strong>1.</strong> Escribes tu nombre y correo
        </li>
        <li>
          <strong>2.</strong> Pagas en bolívares desde tu banco (tasa BCV)
        </li>
        <li>
          <strong>3.</strong> El pago se valida solo: el recetario llega a tu correo
        </li>
      </ol>

      <label htmlFor="checkout-name">
        Nombre
        <input
          id="checkout-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) checkName(e.target.value);
          }}
          onBlur={() => name.trim() && checkName(name)}
          autoComplete="name"
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? "checkout-name-error" : undefined}
        />
      </label>
      {nameError ? (
        <p className="field-error" id="checkout-name-error">
          {nameError}
        </p>
      ) : null}
      <label htmlFor="checkout-email">
        Correo
        <input
          id="checkout-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) checkEmail(e.target.value);
          }}
          onBlur={() => {
            setEmailTouched(true);
            if (email.trim()) checkEmail(email);
          }}
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="tucorreo@gmail.com"
          aria-invalid={Boolean(emailError)}
          aria-describedby="checkout-email-hint"
        />
      </label>
      <p
        className={emailError ? "field-error" : emailOk ? "field-ok" : "field-hint"}
        id="checkout-email-hint"
      >
        {emailError ||
          (emailOk
            ? "✓ Bien escrito. A este correo te llega el recetario."
            : "Revísalo con calma: a este correo te llega el recetario.")}
      </p>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="btn btn-lg" type="submit" disabled={saving}>
        {saving ? "Un momento…" : payLabel}
      </button>
      <p className="fine">
        Sin Zelle, sin Binance y sin mandar capturas por chat. El pago se valida
        automáticamente y el recetario llega solo.
      </p>
    </form>
  );
}
