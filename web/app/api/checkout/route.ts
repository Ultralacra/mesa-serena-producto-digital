import { NextResponse } from "next/server";
import { validateEmail } from "@/lib/email";
import { logFlow } from "@/lib/log";
import { createSale } from "@/lib/sale";
import { skylinkConfigured } from "@/lib/skylink";

export async function POST(request: Request) {
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
    return NextResponse.json({ message: "Escribe tu nombre." }, { status: 400 });
  }
  if (checked.error) {
    return NextResponse.json({ message: checked.error }, { status: 400 });
  }

  try {
    const sale = await createSale({
      name,
      email: checked.email,
      source: "checkout",
    });
    return NextResponse.json({
      url: sale.url,
      token: sale.token,
      buyOrder: sale.buyOrder,
      ves: sale.ves,
      priceUsd: sale.priceUsd,
    });
  } catch (error) {
    logFlow("PAGO · FALLÓ crear el cobro", {
      correo: checked.email,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Skylink Pay no pudo crear el cobro.",
      },
      { status: 502 },
    );
  }
}
