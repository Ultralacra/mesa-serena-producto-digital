import { findOrder, markDelivered, patchOrder, type Order } from "@/lib/orders";
import { recetarioAttachment, sendMail } from "@/lib/mail";
import { logFlow, logPaidAndMailed } from "@/lib/log";
import { notifyMailWebhook } from "@/lib/notify-webhook";
import { receiptEmail } from "@/lib/receipt-email";
import { underpaidEmail } from "@/lib/underpaid-email";
import { bsFromCents, type PaymentEvaluation } from "@/lib/payment";
import { PRODUCT } from "@/lib/product";

export async function deliverRecetario(order: Order) {
  logFlow("ENTREGA · se supone que envía el recetario", {
    buyOrder: order.buyOrder,
    nombre: order.name,
    para: order.email || "(sin correo)",
    yaEntregado: order.delivered,
  });

  if (order.delivered) {
    logFlow("ENTREGA · no reenvía, ya se había mandado", {
      buyOrder: order.buyOrder,
      para: order.email,
    });
    return { sent: false, reason: "already" as const };
  }
  if (!order.email) {
    logFlow("ENTREGA · NO puede enviar: la orden no tiene correo", {
      buyOrder: order.buyOrder,
    });
    return { sent: false, reason: "missing-email" as const };
  }

  const letter = receiptEmail(order.name || "cliente");

  const info = await sendMail({
    to: order.email,
    subject: letter.subject,
    text: letter.text,
    html: letter.html,
    attachments: recetarioAttachment(),
  });

  const hook = await notifyMailWebhook({
    type: "compra.pagada.mail.enviado",
    to: order.email,
    name: order.name,
    subject: letter.subject,
    downloadUrl: letter.url,
    message: `COMPRA PAGADA. MAIL ENVIADO a ${order.email}. Adjunto + ${letter.url}`,
    product: PRODUCT.name,
    buyOrder: order.buyOrder,
    amount: order.amountCents,
    currency: "VES",
    smtp: info.response,
    messageId: info.messageId,
  });

  markDelivered(order.buyOrder);
  logPaidAndMailed({
    buyOrder: order.buyOrder,
    nombre: order.name,
    correo: order.email,
    smtp: String(info.response || "ok"),
    webhook: hook.ok ? `webhook.site ${hook.status}` : "webhook.site falló",
  });
  return { sent: true as const };
}

/**
 * Pagó mucho menos: NO sale el recetario, pero SIEMPRE sale un correo
 * avisando cuánto pagó, cuánto cuesta y cuánto faltó. Una sola vez.
 */
export async function notifyUnderpaid(order: Order, evaluation: PaymentEvaluation) {
  logFlow("MONTO INCORRECTO · no se envía el recetario, se avisa por correo", {
    buyOrder: order.buyOrder,
    para: order.email || "(sin correo)",
    pagado: bsFromCents(evaluation.paidCents),
    esperado: bsFromCents(evaluation.expectedCents),
    faltante: bsFromCents(evaluation.missingCents),
    yaAvisado: Boolean(order.underpaidNotified),
  });

  patchOrder(order.buyOrder, {
    paidAmountCents: evaluation.paidCents ?? undefined,
  });

  if (order.underpaidNotified) {
    logFlow("MONTO INCORRECTO · ya se había avisado, no se repite el correo", {
      buyOrder: order.buyOrder,
      para: order.email,
    });
    return { sent: false, reason: "already" as const };
  }
  if (!order.email) {
    logFlow("MONTO INCORRECTO · no hay correo para avisar", { buyOrder: order.buyOrder });
    return { sent: false, reason: "missing-email" as const };
  }

  const letter = underpaidEmail(order.name || "cliente", evaluation, order.buyOrder);
  const info = await sendMail({
    to: order.email,
    subject: letter.subject,
    text: letter.text,
    html: letter.html,
  });

  await notifyMailWebhook({
    type: "compra.monto_incorrecto.mail.enviado",
    to: order.email,
    name: order.name,
    buyOrder: order.buyOrder,
    expectedAmount: evaluation.expectedCents,
    paidAmount: evaluation.paidCents,
    missingAmount: evaluation.missingCents,
    currency: "VES",
    message: `MONTO INCORRECTO. NO se envió el recetario. MAIL DE AVISO ENVIADO a ${order.email}. Pagó ${bsFromCents(evaluation.paidCents)} Bs de ${bsFromCents(evaluation.expectedCents)} Bs; faltaron ${bsFromCents(evaluation.missingCents)} Bs.`,
    smtp: info.response,
    messageId: info.messageId,
  });

  patchOrder(order.buyOrder, { underpaidNotified: true });
  logFlow("MONTO INCORRECTO · MAIL DE AVISO ENVIADO (sin recetario)", {
    buyOrder: order.buyOrder,
    para: order.email,
    faltante: bsFromCents(evaluation.missingCents),
  });
  return { sent: true as const };
}

export async function notifyUnderpaidByRef(id: string, evaluation: PaymentEvaluation) {
  const order = findOrder(id);
  if (!order) {
    logFlow("MONTO INCORRECTO · no hay orden para avisar", { id });
    return { sent: false, reason: "missing" as const };
  }
  return notifyUnderpaid(order, evaluation);
}

export async function deliverByRef(id: string) {
  const order = findOrder(id);
  if (!order) {
    logFlow("ENTREGA · no hay orden para este id", { id });
    return { sent: false, reason: "missing" as const };
  }
  return deliverRecetario(order);
}
