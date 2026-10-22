import { NextResponse } from "next/server";
import { deliverByRef, notifyUnderpaidByRef } from "@/lib/deliver";
import { logFlow } from "@/lib/log";
import { notifyMailWebhook } from "@/lib/notify-webhook";
import { findOrder, markPaid, patchOrder, saveOrder } from "@/lib/orders";
import { bsFromCents, evaluatePayment } from "@/lib/payment";
import {
  findPurchaseRecord,
  recordPurchase,
  recordWebhookEvent,
} from "@/lib/registry";

type SkylinkWebhook = {
  eventType?: string;
  transaction?: {
    id?: string;
    buyOrder?: string;
    amount?: number;
    paidAmount?: number;
    currency?: string;
    status?: string;
    resultCode?: string;
    resultMessage?: string;
  };
};

export async function POST(request: Request) {
  const rawText = await request.text().catch(() => "");
  let body: SkylinkWebhook;
  try {
    body = JSON.parse(rawText) as SkylinkWebhook;
  } catch {
    logFlow("WEBHOOK · JSON inválido", {});
    await recordWebhookEvent({ decision: "invalid", raw: rawText });
    return NextResponse.json({ ok: false, message: "JSON inválido." }, { status: 400 });
  }

  const status = body.transaction?.status ?? "";
  const buyOrder = body.transaction?.buyOrder ?? "";
  let existing = buyOrder ? findOrder(buyOrder) : undefined;

  const evaluation = evaluatePayment({
    status,
    resultCode: body.transaction?.resultCode,
    expectedCents: Number(body.transaction?.amount || existing?.amountCents || 0),
    paidCents:
      body.transaction?.paidAmount === undefined ? null : Number(body.transaction.paidAmount),
  });

  logFlow("WEBHOOK · llegó de Skylink", {
    eventType: body.eventType,
    buyOrder,
    status,
    resultCode: body.transaction?.resultCode,
    esperado: bsFromCents(evaluation.expectedCents),
    pagado: bsFromCents(evaluation.paidCents),
    faltante: bsFromCents(evaluation.missingCents),
    decision: evaluation.state,
    entrega: evaluation.deliver,
    cuerpo: body,
  });

  // SUPER IMPORTANTE: todo lo que llega al webhook queda guardado tal cual,
  // aunque venga pendiente, rechazado o sin orden local.
  await recordWebhookEvent({
    eventType: body.eventType,
    buyOrder: buyOrder || undefined,
    skylinkStatus: status || undefined,
    resultCode: body.transaction?.resultCode,
    resultMessage: body.transaction?.resultMessage,
    amountCents:
      body.transaction?.amount === undefined
        ? undefined
        : Number(body.transaction.amount),
    paidAmountCents:
      body.transaction?.paidAmount === undefined
        ? undefined
        : Number(body.transaction.paidAmount),
    currency: body.transaction?.currency,
    decision: evaluation.state,
    raw: body,
  });

  // En Vercel la orden del checkout puede vivir en otra instancia:
  // se recupera nombre/correo/monto desde el registro duradero.
  if (buyOrder && !existing?.email) {
    const saved = await findPurchaseRecord(buyOrder);
    if (saved?.email) {
      saveOrder({
        buyOrder,
        sessionId: saved.sessionId || buyOrder,
        token: saved.token || "",
        name: saved.name || "Cliente",
        email: saved.email,
        amountCents: saved.amountCents || evaluation.expectedCents,
        status: saved.delivered ? "paid" : "created",
        delivered: saved.delivered,
        createdAt: saved.createdAt,
        paidAmountCents: saved.paidAmountCents,
      });
      existing = findOrder(buyOrder);
    }
  }

  if (buyOrder) {
    await recordPurchase({
      buyOrder,
      name: existing?.name,
      email: existing?.email,
      amountCents: evaluation.expectedCents || existing?.amountCents || 0,
      paidAmountCents: evaluation.paidCents ?? undefined,
      status:
        evaluation.state === "approved"
          ? "paid"
          : evaluation.state === "underpaid"
            ? "underpaid"
            : "pending",
      delivered: Boolean(existing?.delivered),
      source: "webhook",
      createdAt: existing?.createdAt,
    });
  }

  await notifyMailWebhook({
    type:
      evaluation.state === "approved"
        ? "compra.pagada"
        : evaluation.state === "underpaid"
          ? "compra.monto_incorrecto"
          : "compra.no_aprobada",
    eventType: body.eventType,
    buyOrder,
    status,
    resultCode: body.transaction?.resultCode,
    resultMessage: body.transaction?.resultMessage,
    amount: body.transaction?.amount,
    paidAmount: body.transaction?.paidAmount,
    missingAmount: evaluation.missingCents || undefined,
    currency: body.transaction?.currency,
    skylink: body,
  });

  if (!buyOrder || evaluation.state === "pending") {
    logFlow("WEBHOOK · ignorado (no es pago aprobado ni monto incorrecto)", {
      buyOrder,
      status,
      decision: evaluation.state,
    });
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (!existing) {
    saveOrder({
      buyOrder,
      sessionId: buyOrder,
      token: "",
      name: "Cliente",
      email: "",
      amountCents: evaluation.expectedCents,
      status: evaluation.deliver ? "paid" : "created",
      delivered: false,
      createdAt: new Date().toISOString(),
      paidAmountCents: evaluation.paidCents ?? undefined,
    });
  }

  if (evaluation.state === "underpaid") {
    patchOrder(buyOrder, { paidAmountCents: evaluation.paidCents ?? undefined });
    logFlow("WEBHOOK · MONTO INCORRECTO: no se envía el recetario", {
      buyOrder,
      pagado: bsFromCents(evaluation.paidCents),
      esperado: bsFromCents(evaluation.expectedCents),
      faltante: bsFromCents(evaluation.missingCents),
      correo: existing?.email || "(sin correo)",
    });
    if (!existing?.email) {
      return NextResponse.json({ ok: true, underpaid: true, notified: false });
    }
    try {
      const notice = await notifyUnderpaidByRef(buyOrder, evaluation);
      await recordPurchase({
        buyOrder,
        name: existing.name,
        email: existing.email,
        amountCents: evaluation.expectedCents,
        paidAmountCents: evaluation.paidCents ?? undefined,
        status: "underpaid",
        underpaidNotified: notice.sent || notice.reason === "already",
        source: "webhook",
        createdAt: existing.createdAt,
      });
      return NextResponse.json({ ok: true, underpaid: true, notified: notice.sent });
    } catch (error) {
      logFlow("WEBHOOK · el correo de monto incorrecto falló", {
        buyOrder,
        para: existing.email,
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json(
        {
          ok: false,
          message:
            error instanceof Error ? error.message : "No se pudo avisar por correo.",
        },
        { status: 500 },
      );
    }
  }

  // Aprobado (completo, de más, o faltante dentro de la tolerancia).
  markPaid(buyOrder);
  if (evaluation.withinTolerance) {
    logFlow("WEBHOOK · faltante mínimo dentro de tolerancia: se entrega igual", {
      buyOrder,
      faltante: bsFromCents(evaluation.missingCents),
      tolerancia: bsFromCents(evaluation.toleranceCents),
    });
  }
  logFlow("WEBHOOK · buscando la orden local", {
    buyOrder,
    encontrada: Boolean(existing),
    nombre: existing?.name,
    correo: existing?.email || "(sin correo)",
    yaEntregado: existing?.delivered,
  });

  if (!existing?.email) {
    logFlow("WEBHOOK · pago ok, pero NO hay correo para enviar", { buyOrder });
    return NextResponse.json({ ok: true, queued: true });
  }

  try {
    logFlow("WEBHOOK · disparando envío de recetario", {
      buyOrder,
      para: existing.email,
    });
    const delivery = await deliverByRef(buyOrder);
    await recordPurchase({
      buyOrder,
      name: existing.name,
      email: existing.email,
      amountCents: evaluation.expectedCents,
      paidAmountCents: evaluation.paidCents ?? undefined,
      status: "paid",
      delivered: delivery.sent || delivery.reason === "already",
      source: "webhook",
      createdAt: existing.createdAt,
    });
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
