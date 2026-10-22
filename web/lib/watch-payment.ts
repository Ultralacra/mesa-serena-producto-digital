import { deliverByRef, notifyUnderpaidByRef } from "@/lib/deliver";
import { logFlow } from "@/lib/log";
import { notifyMailWebhook } from "@/lib/notify-webhook";
import { findOrder, markPaid, patchOrder } from "@/lib/orders";
import { bsFromCents, evaluatePayment } from "@/lib/payment";
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
      const order = findOrder(token) ?? findOrder(buyOrder);
      const data = charge.data as Record<string, unknown>;
      const paidRaw = data.paidAmount ?? data.paid_amount;
      const evaluation = evaluatePayment({
        status: charge.status,
        resultCode: String(data.resultCode ?? data.result_code ?? ""),
        expectedCents: Number(data.amount ?? order?.amountCents ?? 0),
        paidCents: paidRaw === undefined ? null : Number(paidRaw),
      });

      logFlow("LOCAL · consulta a Skylink", {
        intento: attempt,
        buyOrder,
        status: charge.status,
        decision: evaluation.state,
        pagado: bsFromCents(evaluation.paidCents),
        faltante: bsFromCents(evaluation.missingCents),
      });

      if (evaluation.state === "pending") continue;

      if (evaluation.state === "underpaid") {
        patchOrder(buyOrder, { paidAmountCents: evaluation.paidCents ?? undefined });
        await notifyMailWebhook({
          type: "compra.monto_incorrecto",
          eventType: "transaction.needs_review",
          buyOrder: order?.buyOrder || buyOrder,
          status: charge.status,
          resultCode: "MONTO_NO_COINCIDE",
          amount: evaluation.expectedCents,
          paidAmount: evaluation.paidCents,
          missingAmount: evaluation.missingCents,
          currency: "VES",
          to: order?.email,
          name: order?.name,
          origen: "poll-local",
          skylink: charge.data,
        });
        if (order?.email) {
          await notifyUnderpaidByRef(order.buyOrder, evaluation);
        } else {
          logFlow("LOCAL · monto incorrecto, pero no hay correo en la orden", { buyOrder });
        }
        return;
      }

      // Aprobado (completo, de más, o faltante dentro de tolerancia).
      markPaid(token);
      await notifyMailWebhook({
        type: "compra.pagada",
        eventType: "transaction.authorized",
        buyOrder: order?.buyOrder || buyOrder,
        status: charge.status,
        resultCode: "APPROVED",
        amount: evaluation.expectedCents || order?.amountCents,
        paidAmount: evaluation.paidCents ?? undefined,
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
