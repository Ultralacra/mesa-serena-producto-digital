import { PRODUCT } from "@/lib/product";

export const RECETARIO_URL =
  process.env.RECETARIO_DOWNLOAD_URL?.trim() ||
  "https://mediumorchid-pig-468212.hostingersite.com/wp-content/uploads/2026/10/Mesa-Serena-recetario.pdf";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[
      character
    ] ?? character,
  );
}

export function receiptEmail(name: string) {
  const safeName = escapeHtml(name || "cliente");
  const url = RECETARIO_URL;
  const subject = `Tu recetario ${PRODUCT.name} ya está listo`;
  const text = [
    `Hola ${name || "cliente"},`,
    "",
    "Gracias por la compra. Tu pago quedó aprobado.",
    `${PRODUCT.name} ya es tuyo: 50 recetas criollas, cómo armar el plato, la arepa, tres menús de 7 días y la lista de mercado.`,
    "",
    "Tu recetario va adjunto en este correo.",
    "Si no puedes abrirlo, descárgalo aquí:",
    url,
    "",
    "Empieza por la receta 01. El domingo elige un menú y copia la lista de mercado.",
    "",
    "Recetario educativo. No sustituye a tu médico. Si usas insulina o pastillas, cualquier cambio se habla con ellos.",
    "",
    "Mesa Serena",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;background:#f3eee4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3eee4;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:560px;background:#fffaf3;border:1px solid #e6d7bc;">
          <tr>
            <td style="background:#163028;padding:36px 36px 32px;">
              <p style="margin:0;font-family:Georgia,serif;letter-spacing:.32em;font-size:11px;color:#e7c98a;">MESA SERENA</p>
              <h1 style="margin:16px 0 0;font-family:Georgia,serif;font-weight:normal;font-size:38px;line-height:1.05;color:#f6f0e4;">Gracias por sentarte a la mesa.</h1>
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:#c45c3a;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:32px 36px 8px;font-family:Georgia,serif;color:#241c16;font-size:17px;line-height:1.55;">
              <p style="margin:0 0 16px;">Hola ${safeName},</p>
              <p style="margin:0 0 16px;">Tu pago quedó aprobado. Ya es tuyo <strong>${PRODUCT.name}</strong>: 50 recetas criollas, cómo armar el plato, la arepa, tres menús de 7 días y la lista de mercado.</p>
              <p style="margin:0 0 8px;">Tu <strong>recetario</strong> va adjunto en este correo. Si no lo ves o no abre, descárgalo con el botón.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:18px 36px 8px;">
              <a href="${url}" style="display:inline-block;background:#c45c3a;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;letter-spacing:.02em;padding:15px 28px;border-radius:999px;">Descargar el recetario</a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 36px 24px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#6d6458;">
              O copia este enlace:<br />
              <a href="${url}" style="color:#163028;word-break:break-all;">${url}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 28px;font-family:Georgia,serif;color:#241c16;font-size:16px;line-height:1.55;">
              <p style="margin:0 0 16px;">Empieza por la receta 01, el perico con arepa pequeña. El domingo elige un menú y copia la lista de mercado.</p>
              <p style="margin:0;font-size:13px;color:#6d6458;">Recetario educativo. No diagnostica, no trata y no sustituye a tu médico. Si usas insulina o pastillas, cualquier cambio se habla con ellos.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#163028;padding:20px 36px;font-family:Georgia,serif;font-size:14px;color:#e7dfd2;">
              Come lo de tu casa. Sin que se te dispare. Sin comprar como rico.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html, url };
}
