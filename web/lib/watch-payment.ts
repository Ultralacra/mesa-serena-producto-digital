import { deliverByRef } from "@/lib/deliver";
import { logFlow } from "@/lib/log";
import { notifyMailWebhook } from "@/lib/notify-webhook";
import { findOrder, markPaid } from "@/lib/orders";
import { readSkylinkCharge } from "@/lib/skylink";

const watching = new Set<string>();

export function watchPaymentLocally(token: string, buyOrder: string) {
  if (!token || watching.has(token)) return;
  watching.add(token);
  logFlow("LOCAL · vigilando el cobro (Skylink no pega a localhost)", {
    token,
    buyOrder,
    nota: "Cuando Skylink lo marque autorizado, enviamos el mail y posteamos webhook.site",
  });
  void poll(token, buyOrder).finally(() => watching.delete(token));
}

async function poll(token: string, buyOrder: string) {
  for (let attempt = 1; attempt <= 60; attempt += 1) {
    await sleep(attempt === 1 ? 2000 : 5000);
    try {
      const charge = await readSkylinkCharge(token);
      logFlow("LOCAL · consulta a Skylink", {
        intento: attempt,
        buyOrder,
        status: charge.status,
        pagado: charge.paid,
      });
      if (!charge.paid) continue;

      markPaid(token);
      const order = findOrder(token) ?? findOrder(buyOrder);
      await notifyMailWebhook({
        type: "compra.pagada",
        eventType: "transaction.authorized",
        buyOrder: order?.buyOrder || buyOrder,
        status: charge.status,
        resultCode: "APPROVED",
        amount: order?.amountCents,
        currency: "VES",
        to: order?.email,
        name: order?.name,
        origen: "poll-local",
        skylink: charge.data,
      });
      if (order?.email) {
        await deliverByRef(order.buyOrder);
      } else {
        logFlow("LOCAL · pagado, pero no hay correo en la orden", { buyOrder });
      }
      return;
    } catch (error) {
      logFlow("LOCAL · error consultando Skylink", {
        intento: attempt,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  logFlow("LOCAL · se acabó el tiempo de vigilancia (5 min)", { buyOrder, token });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
