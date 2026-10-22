import { NextResponse } from "next/server";
import { logFlow } from "@/lib/log";
import { saveOrder } from "@/lib/orders";
import { PRODUCT } from "@/lib/product";
import { createSkylinkCharge, skylinkConfigured } from "@/lib/skylink";
import { watchPaymentLocally } from "@/lib/watch-payment";

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
  const email = body.email?.trim() ?? "";
  if (name.length < 3) {
    return NextResponse.json({ message: "Escribe tu nombre." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: "El correo no es válido." }, { status: 400 });
  }

  const stamp = Date.now().toString(36).toUpperCase();
  const buyOrder = `MS-${stamp}`;
  const sessionId = `SES-${stamp}`;

  logFlow("USUARIO · pidió pagar", {
    nombre: name,
    correo: email,
    buyOrder,
    cobroPruebaBs: PRODUCT.testVes,
  });

  try {
    const amountCents = Number(process.env.PRICE_VES_CENTS || PRODUCT.testCents);
    const charge = await createSkylinkCharge({
      amountCents,
      buyOrder,
      sessionId,
    });
    saveOrder({
      buyOrder,
      sessionId,
      token: charge.token,
      name,
      email,
      amountCents,
      status: "created",
      delivered: false,
      createdAt: new Date().toISOString(),
    });
    logFlow("PAGO · cobro creado en Skylink, redirigiendo al usuario", {
      nombre: name,
      correo: email,
      buyOrder,
      token: charge.token,
      url: charge.url,
      montoBs: charge.ves,
    });
    watchPaymentLocally(charge.token, buyOrder);
    return NextResponse.json({
      url: charge.url,
      token: charge.token,
      buyOrder,
      ves: charge.ves,
      priceUsd: PRODUCT.priceUsd,
    });
  } catch (error) {
    logFlow("PAGO · FALLÓ crear el cobro", {
      correo: email,
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
