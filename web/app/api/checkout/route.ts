import { NextResponse } from "next/server";
import { validateEmail } from "@/lib/email";
import { logFlow } from "@/lib/log";
import { saveOrder } from "@/lib/orders";
import { recordPurchase } from "@/lib/registry";
import { formatVes, PRODUCT, vesCentsForRate } from "@/lib/product";
import { bcvRate, createSkylinkCharge, skylinkConfigured } from "@/lib/skylink";
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
  const checked = validateEmail(body.email ?? "");
  const email = checked.email;
  if (name.length < 3) {
    return NextResponse.json({ message: "Escribe tu nombre." }, { status: 400 });
  }
  if (checked.error) {
    return NextResponse.json({ message: checked.error }, { status: 400 });
  }

  const stamp = Date.now().toString(36).toUpperCase();
  const buyOrder = `MS-${stamp}`;
  const sessionId = `SES-${stamp}`;

  logFlow("USUARIO · pidió pagar", {
    nombre: name,
    correo: email,
    buyOrder,
    precioUsd: PRODUCT.priceUsd,
  });

  try {
    const rate = await bcvRate();
    const amountCents = vesCentsForRate(rate);
    logFlow("PAGO · monto real calculado a tasa BCV", {
      buyOrder,
      precioUsd: PRODUCT.priceUsd,
      tasaBcv: formatVes(rate),
      montoBs: formatVes(amountCents / 100),
    });
    const charge = await createSkylinkCharge({
      amountCents,
      buyOrder,
      sessionId,
      customerName: name,
      customerEmail: email,
    });
    const customerSession = charge.sessionId || sessionId;
    saveOrder({
      buyOrder,
      sessionId: customerSession,
      token: charge.token,
      name,
      email,
      amountCents,
      status: "created",
      delivered: false,
      createdAt: new Date().toISOString(),
    });
    await recordPurchase({
      buyOrder,
      sessionId: customerSession,
      token: charge.token,
      name,
      email,
      amountCents,
      status: "created",
      source: "checkout",
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
