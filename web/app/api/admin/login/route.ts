import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminConfigured,
  createSessionToken,
  sessionCookieOptions,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import { logFlow } from "@/lib/log";

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      {
        message:
          "El admin no está configurado: faltan ADMIN_USER y ADMIN_PASSWORD.",
      },
      { status: 503 },
    );
  }

  let body: { user?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Datos inválidos." }, { status: 400 });
  }

  // Pequeña pausa para frenar intentos de adivinar la clave.
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (!verifyAdminCredentials(body.user ?? "", body.password ?? "")) {
    logFlow("ADMIN · intento de ingreso rechazado", { usuario: body.user });
    return NextResponse.json(
      { message: "Usuario o contraseña incorrectos." },
      { status: 401 },
    );
  }

  logFlow("ADMIN · ingreso correcto", { usuario: body.user });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createSessionToken(), sessionCookieOptions());
  return response;
}
