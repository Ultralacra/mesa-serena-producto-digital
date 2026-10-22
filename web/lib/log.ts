export function logFlow(step: string, detail: Record<string, unknown> = {}) {
  const time = new Date().toLocaleString("es-VE", { timeZone: "America/Caracas" });
  console.log(`\n========== [MESA] ${step} · ${time} ==========`);
  for (const [key, value] of Object.entries(detail)) {
    console.log(`  ${key}:`, value);
  }
  console.log("====================================================\n");
}

export function logPaidAndMailed(detail: {
  buyOrder: string;
  nombre: string;
  correo: string;
  smtp?: string;
  webhook?: string;
}) {
  console.log("\n");
  console.log("**************************************************");
  console.log("  COMPRA PAGADA");
  console.log(`  buyOrder: ${detail.buyOrder}`);
  console.log(`  nombre:   ${detail.nombre}`);
  console.log(`  correo:   ${detail.correo}`);
  console.log("  MAIL ENVIADO");
  if (detail.smtp) console.log(`  smtp:     ${detail.smtp}`);
  if (detail.webhook) console.log(`  webhook:  ${detail.webhook}`);
  console.log("**************************************************");
  console.log("\n");
}
