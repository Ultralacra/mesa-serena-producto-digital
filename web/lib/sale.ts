import { logFlow } from "@/lib/log";
import { saveOrder } from "@/lib/orders";
import { recordPurchase } from "@/lib/registry";
import { formatVes, PRODUCT, vesCentsForRate } from "@/lib/product";
import { bcvRate, createSkylinkCharge, skylinkConfigured } from "@/lib/skylink";
import { watchPaymentLocally } from "@/lib/watch-payment";

export async function createSale(input: {
  name: string;
  email: string;
  source: "checkout" | "whatsapp";
  /** Si viene, cobra ese monto en céntimos de bolívar y no usa la tasa BCV. */
  amountCents?: number;
}) {
  if (!skylinkConfigured()) {
    throw new Error("Faltan las credenciales de Skylink Pay.");
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const stamp = Date.now().toString(36).toUpperCase();
  const buyOrder = `MS-${stamp}`;
  const sessionId = `SES-${stamp}`;

  logFlow("USUARIO · pidió pagar", {
    nombre: name,
    correo: email,
    buyOrder,
    origen: input.source,
    precioUsd: PRODUCT.priceUsd,
  });

  const amountCents =
    input.amountCents && input.amountCents > 0
      ? Math.round(input.amountCents)
      : vesCentsForRate(await bcvRate());
  logFlow(
    input.amountCents
      ? "PAGO · monto fijo de prueba"
      : "PAGO · monto real calculado a tasa BCV",
    {
      buyOrder,
      precioUsd: PRODUCT.priceUsd,
      montoBs: formatVes(amountCents / 100),
    },
  );

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
    source: input.source,
  });
  logFlow("PAGO · cobro creado en Skylink", {
    nombre: name,
    correo: email,
    buyOrder,
    origen: input.source,
    token: charge.token,
    url: charge.url,
    montoBs: charge.ves,
  });
  watchPaymentLocally(charge.token, buyOrder);

  return {
    url: charge.url,
    token: charge.token,
    buyOrder,
    ves: charge.ves,
    priceUsd: PRODUCT.priceUsd,
    name,
    email,
  };
}
