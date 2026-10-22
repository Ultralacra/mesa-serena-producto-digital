const DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.co": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "outlook.con": "outlook.com",
  "yahoo.con": "yahoo.com",
  "icloud.con": "icloud.com",
};

export function normalizeEmail(raw: string) {
  return raw.trim().toLowerCase();
}

/** Devuelve el correo limpio o un mensaje listo para mostrarle a la persona. */
export function validateEmail(raw: string): { email: string; error: string } {
  const email = normalizeEmail(raw);
  if (!email) return { email, error: "Escribe tu correo. Ahí te llega el recetario." };
  if (/\s/.test(email)) return { email, error: "El correo no puede tener espacios." };

  const parts = email.split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { email, error: "Ese correo no se ve completo. Debe ser algo como nombre@correo.com." };
  }
  const [local, domain] = parts;

  if (
    local.length > 64 ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..") ||
    !/^[a-z0-9._%+-]+$/.test(local)
  ) {
    return { email, error: "Revisa lo que va antes del @: tiene caracteres que no van en un correo." };
  }

  const labels = domain.split(".");
  const tld = labels[labels.length - 1] ?? "";
  if (
    labels.length < 2 ||
    labels.some((label) => !label || label.startsWith("-") || label.endsWith("-") || !/^[a-z0-9-]+$/.test(label)) ||
    !/^[a-z]{2,}$/.test(tld)
  ) {
    return { email, error: "Revisa lo que va después del @: falta el dominio completo, como gmail.com." };
  }

  const suggestion = DOMAIN_TYPOS[domain];
  if (suggestion) {
    return { email, error: `Ojo: escribiste @${domain}. ¿Será @${suggestion}? Corrígelo para que te llegue.` };
  }

  return { email, error: "" };
}

export function isValidEmail(raw: string) {
  return validateEmail(raw).error === "";
}
