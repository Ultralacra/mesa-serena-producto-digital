import { bsFromCents, type PaymentEvaluation } from "@/lib/payment";

function esc(value: string) {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

export function underpaidEmail(
  name: string,
  evaluation: PaymentEvaluation,
  buyOrder: string,
) {
  const first = (name || "cliente").trim().split(/\s+/)[0] || "cliente";
  const paid = bsFromCents(evaluation.paidCents);
  const expected = bsFromCents(evaluation.expectedCents);
  const missing = bsFromCents(evaluation.missingCents);
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const buyUrl = `${site}/#comprar`;

  const subject = "Tu pago quedó incompleto — Mesa Serena";
  const text = [
    `Hola, ${first}.`,
    "",
    "Recibimos un pago, pero el monto no fue el correcto y tu recetario todavía no puede salir.",
    "",
    `Pagaste: ${paid} Bs`,
    `El recetario cuesta: ${expected} Bs`,
    `Te faltaron: ${missing} Bs`,
    `Orden: ${buyOrder}`,
    "",
    "Qué hacer ahora:",
    "1. Vuelve a la página de Mesa Serena.",
    "2. Haz la compra de nuevo escribiendo el monto completo y exacto que muestra la página.",
    "3. Si pagas con pago móvil, revisa el monto antes de confirmar: un número mal escrito deja el pago en revisión.",
    "",
    `Completar mi compra: ${buyUrl}`,
    "",
    "El abono que hiciste quedó registrado en la pasarela como pago en revisión, con tu número de orden.",
    "",
    "— Mesa Serena",
    "Recetario educativo. No sustituye a tu médico.",
  ].join("\n");

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;padding:0;background:#F6F0E4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F0E4;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFBF4;border-radius:20px;overflow:hidden;border:1px solid #E3D9C4;">
  <tr><td style="background:#1B3A2F;padding:34px 40px;">
    <div style="font-family:Georgia,serif;font-size:15px;letter-spacing:4px;color:#C4A46A;">MESA SERENA</div>
    <div style="font-family:Georgia,serif;font-size:32px;line-height:1.2;color:#F6F0E4;margin-top:12px;">Tu pago quedó <em>incompleto</em></div>
  </td></tr>
  <tr><td style="height:6px;background:#C45C3A;"></td></tr>
  <tr><td style="padding:34px 40px;font-family:Arial,Helvetica,sans-serif;color:#1C1B16;">
    <p style="font-size:17px;line-height:1.6;margin:0 0 16px;">Hola, ${esc(first)}.</p>
    <p style="font-size:16px;line-height:1.65;margin:0 0 22px;">Recibimos un pago, pero el monto no fue el correcto y tu recetario todavía no puede salir. Esto pasa mucho con pago móvil: un número mal escrito y el pago queda en revisión.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F0E4;border-radius:14px;margin:0 0 24px;">
      <tr><td style="padding:16px 20px;font-size:15px;color:#5C635D;">Pagaste</td><td align="right" style="padding:16px 20px;font-size:17px;font-weight:bold;color:#1B3A2F;">${paid} Bs</td></tr>
      <tr><td style="padding:16px 20px;font-size:15px;color:#5C635D;border-top:1px solid #E3D9C4;">El recetario cuesta</td><td align="right" style="padding:16px 20px;font-size:17px;font-weight:bold;color:#1B3A2F;border-top:1px solid #E3D9C4;">${expected} Bs</td></tr>
      <tr><td style="padding:16px 20px;font-size:15px;color:#9A3F26;border-top:1px solid #E3D9C4;">Te faltaron</td><td align="right" style="padding:16px 20px;font-size:17px;font-weight:bold;color:#9A3F26;border-top:1px solid #E3D9C4;">${missing} Bs</td></tr>
    </table>
    <p style="font-size:16px;line-height:1.65;margin:0 0 10px;"><strong>Qué hacer ahora:</strong></p>
    <p style="font-size:15px;line-height:1.7;margin:0 0 24px;color:#3E4A42;">1. Vuelve a la página.<br/>2. Haz la compra de nuevo con el <strong>monto completo y exacto</strong> que muestra la página.<br/>3. Antes de confirmar el pago móvil, revisa el monto dígito por dígito.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="background:#C45C3A;border-radius:999px;">
      <a href="${buyUrl}" style="display:inline-block;padding:16px 32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#FFFBF4;text-decoration:none;">Completar mi compra</a>
    </td></tr></table>
    <p style="font-size:13px;line-height:1.6;color:#7A7F78;margin:0;">El abono que hiciste quedó registrado en la pasarela como pago en revisión. Orden: ${esc(buyOrder)}.<br/>Recetario educativo. No sustituye a tu médico.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { subject, text, html };
}
