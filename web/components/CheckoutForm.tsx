"use client";

import { useEffect, useState, type FormEvent } from "react";
import { normalizeEmail, validateEmail } from "@/lib/email";
import { LaunchCountdown } from "@/components/LaunchCountdown";
import {
  formatVes,
  isLaunchOfferActive,
  OFFER,
  PRODUCT,
  WHATSAPP_URL,
} from "@/lib/product";

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
  const launch = isLaunchOfferActive();
  const payLabel = quote.equivalentVes
    ? `Pagar ${formatVes(quote.equivalentVes)} Bs ahora`
    : `Pagar ${PRODUCT.priceUsd} USD ahora`;

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
      <p className="checkout-promise">
        En menos de 1 minuto lo tienes en el correo. Pagas en bolívares; el pago
        se valida solo.
      </p>
      <p className="checkout-value">
        No es un archivo suelto: <strong>menú de 7 días</strong>,{" "}
        <strong>50 recetas caseras</strong> y <strong>lista de mercado</strong>.
      </p>
      {launch ? (
        <p className="offer-tag">
          {OFFER.label}: de {OFFER.compareAtUsd} a {PRODUCT.priceUsd} USD · hoy
        </p>
      ) : null}
      <div className="price-row">
        {launch ? <span className="was">{OFFER.compareAtUsd} USD</span> : null}
        <span className="now">{PRODUCT.priceUsd} USD</span>
      </div>
      {quote.equivalentVes ? (
        <p className="ves-big">
          Hoy pagas <strong>{formatVes(quote.equivalentVes)} Bs</strong>
        </p>
      ) : (
        <p className="fine">{quote.message || "Precio en bolívares a tasa BCV al pagar."}</p>
      )}
      {launch ? <LaunchCountdown endsAtIso={OFFER.endsAtIso} /> : null}
      {quote.rate ? (
        <p className="fine">Tasa BCV {formatVes(quote.rate)}. Sin Zelle ni capturas.</p>
      ) : null}

      <ol className="pay-steps" aria-label="Cómo pagar">
        <li>
          <strong>1.</strong> Nombre y correo
        </li>
        <li>
          <strong>2.</strong> Pagas en Bs desde tu banco
        </li>
        <li>
          <strong>3.</strong> Se valida solo → recetario al correo
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
        Correo (aquí llega tu recetario)
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
            ? "✓ Listo. A este correo te llega la guía."
            : "Revísalo: a este correo te llega la guía digital.")}
      </p>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="btn btn-lg" type="submit" disabled={saving}>
        {saving ? "Abriendo el pago…" : payLabel}
      </button>
      <p className="fine checkout-secure">
        Pago seguro con Skylink. Validación automática. Sin chats ni capturas.
      </p>
      <a
        className="checkout-wa"
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        ¿Dudas antes de pagar? Escríbenos por WhatsApp
      </a>
    </form>
  );
}
