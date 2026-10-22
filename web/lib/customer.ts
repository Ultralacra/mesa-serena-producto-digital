/**
 * Skylink no tiene un campo de cliente, pero sí guarda y devuelve sessionId
 * en la transacción y en el webhook. Ahí viajan nombre y correo de quien
 * creó el cobro, para poder leerlos aunque el aviso llegue a otro servidor.
 */

export function sessionIdForCustomer(name: string, email: string) {
  const safeName = name.replace(/\|/g, " ").trim().slice(0, 80) || "Cliente";
  const safeEmail = email.trim().slice(0, 160);
  return `${safeName}|${safeEmail}`;
}

export function customerFromSession(sessionId?: string | null) {
  if (!sessionId || sessionId.startsWith("SES-") || !sessionId.includes("|")) {
    return { name: "", email: "" };
  }
  const cut = sessionId.indexOf("|");
  const name = sessionId.slice(0, cut).trim();
  const email = sessionId.slice(cut + 1).trim();
  if (!email.includes("@")) return { name: "", email: "" };
  return { name, email };
}

/** Lee el cliente desde el cuerpo de un webhook o de una consulta a Skylink. */
export function customerFromPayload(raw: unknown) {
  if (!raw || typeof raw !== "object") return { name: "", email: "" };
  const body = raw as Record<string, unknown>;
  const transaction =
    body.transaction && typeof body.transaction === "object"
      ? (body.transaction as Record<string, unknown>)
      : body;
  const fromSession = customerFromSession(
    typeof transaction.sessionId === "string" ? transaction.sessionId : "",
  );
  if (fromSession.email) return fromSession;

  const nested = ["customer", "payer", "client"].map((key) => transaction[key]);
  for (const item of nested) {
    if (!item || typeof item !== "object") continue;
    const person = item as Record<string, unknown>;
    const email = String(person.email ?? person.customerEmail ?? "").trim();
    const name = String(person.name ?? person.customerName ?? "").trim();
    if (email.includes("@")) return { name, email };
  }

  const email = String(
    transaction.customerEmail ?? transaction.email ?? "",
  ).trim();
  const name = String(transaction.customerName ?? transaction.name ?? "").trim();
  if (email.includes("@")) return { name, email };
  return { name: "", email: "" };
}
