import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { validateEmail } from "@/lib/email";
import { createSale } from "@/lib/sale";
import { skylinkConfigured } from "@/lib/skylink";

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }
  if (!skylinkConfigured()) {
    return NextResponse.json(
      { message: "Faltan las credenciales de Skylink Pay." },
      { status: 500 },
    );
  }

  let body: { name?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "El pedido no es válido." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const checked = validateEmail(body.email ?? "");
  if (name.length < 3) {
    return NextResponse.json(
      { message: "Escribe el nombre de quien va a pagar." },
      { status: 400 },
    );
  }
  if (checked.error) {
    return NextResponse.json({ message: checked.error }, { status: 400 });
  }

  try {
    const sale = await createSale({
      name,
      email: checked.email,
      source: "whatsapp",
    });
    return NextResponse.json(sale);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Skylink Pay no pudo crear el enlace.",
      },
      { status: 502 },
    );
  }
}
