import { NextResponse } from "next/server";
import { deliverByRef, notifyUnderpaidByRef } from "@/lib/deliver";
import { logFlow } from "@/lib/log";
import { findOrder, markPaid, patchOrder } from "@/lib/orders";
import { bsFromCents, evaluatePayment } from "@/lib/payment";
import { readSkylinkCharge } from "@/lib/skylink";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";
  const buyOrder = new URL(request.url).searchParams.get("buyOrder")?.trim() ?? "";
  if (!token && !buyOrder) {
    return NextResponse.json({ message: "Falta el token del cobro." }, { status: 400 });
  }

  logFlow("RETORNO · el usuario volvió de Skylink (/gracias)", { token, buyOrder });

  try {
    const charge = token
      ? await readSkylinkCharge(token)
      : { status: "unknown", paid: false, data: {} as Record<string, unknown> };
    const order = findOrder(token || buyOrder);

    const data = charge.data as Record<string, unknown>;
    const paidRaw = data.paidAmount ?? data.paid_amount;
    const evaluation = evaluatePayment({
      status: charge.status,
      resultCode: String(data.resultCode ?? data.result_code ?? ""),
      expectedCents: Number(data.amount ?? order?.amountCents ?? 0),
      paidCents: paidRaw === undefined ? null : Number(paidRaw),
    });

    logFlow("RETORNO · consulta del cobro en Skylink", {
      token,
      status: charge.status,
      esperado: bsFromCents(evaluation.expectedCents),
      pagado: bsFromCents(evaluation.paidCents),
      faltante: bsFromCents(evaluation.missingCents),
      decision: evaluation.state,
      orden: order
        ? { buyOrder: order.buyOrder, nombre: order.name, correo: order.email }
        : null,
    });

    let delivered = Boolean(order?.delivered);
    let deliveryError = "";

    if (evaluation.deliver) {
      markPaid(token || buyOrder);
      if (evaluation.withinTolerance) {
        logFlow("RETORNO · faltante mínimo dentro de tolerancia: se entrega igual", {
          buyOrder: order?.buyOrder,
          faltante: bsFromCents(evaluation.missingCents),
          tolerancia: bsFromCents(evaluation.toleranceCents),
        });
      }
      if (order?.email) {
        try {
          logFlow("RETORNO · pago aprobado, disparando envío de recetario", {
            buyOrder: order.buyOrder,
            para: order.email,
          });
          const result = await deliverByRef(order.buyOrder);
          delivered = result.sent || result.reason === "already";
          logFlow("RETORNO · resultado del envío", {
            para: order.email,
            resultado: result,
          });
        } catch (error) {
          deliveryError =
            error instanceof Error ? error.message : "No se pudo enviar el correo.";
          logFlow("RETORNO · el envío de correo falló", {
            para: order.email,
            error: deliveryError,
          });
        }
      } else {
        logFlow("RETORNO · pago ok, pero no hay correo en la orden", {
          token,
          buyOrder,
        });
      }
    } else if (evaluation.state === "underpaid") {
      patchOrder(token || buyOrder, {
        paidAmountCents: evaluation.paidCents ?? undefined,
      });
      logFlow("RETORNO · MONTO INCORRECTO: no se envía el recetario", {
        buyOrder: order?.buyOrder,
        pagado: bsFromCents(evaluation.paidCents),
        esperado: bsFromCents(evaluation.expectedCents),
        faltante: bsFromCents(evaluation.missingCents),
      });
      if (order?.email) {
        try {
          await notifyUnderpaidByRef(order.buyOrder, evaluation);
        } catch (error) {
          deliveryError =
            error instanceof Error ? error.message : "No se pudo avisar por correo.";
          logFlow("RETORNO · el correo de monto incorrecto falló", {
            para: order.email,
            error: deliveryError,
          });
        }
      }
    } else {
      logFlow("RETORNO · Skylink todavía no marca el cobro como pagado", {
        status: charge.status,
      });
    }

    return NextResponse.json({
      ...charge,
      paid: evaluation.deliver,
      paymentState: evaluation.state,
      expectedCents: evaluation.expectedCents,
      paidCents: evaluation.paidCents,
      missingCents: evaluation.missingCents,
      delivered,
      deliveryError: deliveryError || undefined,
      order: order
        ? { name: order.name, email: order.email, buyOrder: order.buyOrder }
        : null,
    });
  } catch (error) {
    logFlow("RETORNO · error consultando el cobro", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "No se pudo consultar el cobro.",
      },
      { status: 502 },
    );
  }
}
