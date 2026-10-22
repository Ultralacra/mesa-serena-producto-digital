import { logFlow } from "@/lib/log";

const webhookUrl =
  process.env.MAIL_WEBHOOK_URL ||
  "https://webhook.site/8e98a6ed-ddd4-4ba0-b339-1d01cff89a8d";

export async function notifyMailWebhook(payload: Record<string, unknown>) {
  logFlow("WEBHOOK.SITE · posteando el registro", {
    url: webhookUrl,
    tipo: payload.type,
    para: payload.to,
    buyOrder: payload.buyOrder,
  });
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const ok = response.ok;
    logFlow(
      ok
        ? "WEBHOOK.SITE · llegó el registro"
        : "WEBHOOK.SITE · respondió error",
      { status: response.status, tipo: payload.type },
    );
    return { ok, status: response.status };
  } catch (error) {
    logFlow("WEBHOOK.SITE · no se pudo postear", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, status: 0 };
  }
}
