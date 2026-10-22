import { NextResponse } from "next/server";
import { deliverByRef } from "@/lib/deliver";
import { logFlow } from "@/lib/log";
import { findOrder, markPaid } from "@/lib/orders";
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
    logFlow("RETORNO · consulta del cobro en Skylink", {
      token,
      status: charge.status,
      pagado: charge.paid,
      orden: order
        ? { buyOrder: order.buyOrder, nombre: order.name, correo: order.email }
        : null,
    });

    let delivered = Boolean(order?.delivered);
    let deliveryError = "";
    if (charge.paid) {
      markPaid(token || buyOrder);
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
    } else {
      logFlow("RETORNO · Skylink todavía no marca el cobro como pagado", {
        status: charge.status,
      });
    }
    return NextResponse.json({
      ...charge,
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
