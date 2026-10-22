import { createHmac, timingSafeEqual } from "crypto";

/** Autenticación del panel /admin: usuario + contraseña por variables de entorno. */

export const ADMIN_COOKIE = "ms_admin_session";
const SESSION_DAYS = 7;

export function adminConfigured() {
  return Boolean(process.env.ADMIN_USER && process.env.ADMIN_PASSWORD);
}

function secret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "mesa-serena-sin-secreto"
  );
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function verifyAdminCredentials(user: string, password: string) {
  if (!adminConfigured()) return false;
  return (
    safeEqual(user.trim(), process.env.ADMIN_USER!) &&
    safeEqual(password, process.env.ADMIN_PASSWORD!)
  );
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken() {
  const payload = Buffer.from(
    JSON.stringify({
      u: process.env.ADMIN_USER,
      exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token || !adminConfigured()) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload))) return false;
  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { u?: string; exp?: number };
    return data.u === process.env.ADMIN_USER && Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

/** Lee la sesión desde el header Cookie de un Request (para las API). */
export function isAdminRequest(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE}=`));
  const token = match
    ? decodeURIComponent(match.slice(ADMIN_COOKIE.length + 1))
    : null;
  return verifySessionToken(token);
}
