import { findOrder, markDelivered, type Order } from "@/lib/orders";
import { recetarioAttachment, sendMail } from "@/lib/mail";
import { logFlow, logPaidAndMailed } from "@/lib/log";
import { notifyMailWebhook } from "@/lib/notify-webhook";
import { receiptEmail } from "@/lib/receipt-email";
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

export async function deliverByRef(id: string) {
  const order = findOrder(id);
  if (!order) {
    logFlow("ENTREGA · no hay orden para este id", { id });
    return { sent: false, reason: "missing" as const };
  }
  return deliverRecetario(order);
}
