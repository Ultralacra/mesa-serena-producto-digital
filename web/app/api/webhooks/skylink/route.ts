import { NextResponse } from "next/server";
import { deliverByRef } from "@/lib/deliver";
import { logFlow } from "@/lib/log";
import { notifyMailWebhook } from "@/lib/notify-webhook";
import { findOrder, markPaid, saveOrder } from "@/lib/orders";
import { isPaidStatus } from "@/lib/skylink";

type SkylinkWebhook = {
  eventType?: string;
  transaction?: {
    id?: string;
    buyOrder?: string;
    amount?: number;
    currency?: string;
    status?: string;
    resultCode?: string;
    resultMessage?: string;
  };
};

export async function POST(request: Request) {
  let body: SkylinkWebhook;
  try {
    body = await request.json();
  } catch {
    logFlow("WEBHOOK · JSON inválido", {});
    return NextResponse.json({ ok: false, message: "JSON inválido." }, { status: 400 });
  }

  const status = body.transaction?.status ?? "";
  const buyOrder = body.transaction?.buyOrder ?? "";
  const authorized =
    body.eventType === "transaction.authorized" ||
    body.transaction?.resultCode === "APPROVED" ||
    isPaidStatus(status);

  logFlow("WEBHOOK · llegó de Skylink", {
    eventType: body.eventType,
    buyOrder,
    status,
    resultCode: body.transaction?.resultCode,
    amount: body.transaction?.amount,
    autorizado: authorized,
    cuerpo: body,
  });

  await notifyMailWebhook({
    type: authorized ? "compra.pagada" : "compra.no_aprobada",
    eventType: body.eventType,
    buyOrder,
    status,
    resultCode: body.transaction?.resultCode,
    resultMessage: body.transaction?.resultMessage,
    amount: body.transaction?.amount,
    currency: body.transaction?.currency,
    skylink: body,
  });

  if (!authorized || !buyOrder) {
    logFlow("WEBHOOK · ignorado (no es pago aprobado)", { buyOrder, status });
    return NextResponse.json({ ok: true, ignored: true });
  }

  markPaid(buyOrder);
  const existing = findOrder(buyOrder);
  logFlow("WEBHOOK · buscando la orden local", {
    buyOrder,
    encontrada: Boolean(existing),
    nombre: existing?.name,
    correo: existing?.email || "(sin correo)",
    yaEntregado: existing?.delivered,
  });

  if (!existing) {
    saveOrder({
      buyOrder,
      sessionId: buyOrder,
      token: "",
      name: "Cliente",
      email: "",
      amountCents: Number(body.transaction?.amount || 0),
      status: "paid",
      delivered: false,
      createdAt: new Date().toISOString(),
    });
  }

  if (!existing?.email) {
    logFlow("WEBHOOK · pago ok, pero NO hay correo para enviar", { buyOrder });
    return NextResponse.json({ ok: true, queued: true });
  }

  try {
    logFlow("WEBHOOK · disparando envío de recetario", {
      buyOrder,
      para: existing.email,
    });
    await deliverByRef(buyOrder);
    return NextResponse.json({ ok: true, delivered: true });
  } catch (error) {
    logFlow("WEBHOOK · el envío de correo falló", {
      buyOrder,
      para: existing.email,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "No se pudo enviar el recetario.",
      },
      { status: 500 },
    );
  }
}
