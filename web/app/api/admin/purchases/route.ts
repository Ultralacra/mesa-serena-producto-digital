import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { dbEnabled } from "@/lib/db";
import { listAdminData } from "@/lib/registry";

function csvEscape(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const data = await listAdminData();
  const url = new URL(request.url);

  if (url.searchParams.get("format") === "csv") {
    const header = [
      "orden",
      "fecha",
      "nombre",
      "correo",
      "estado",
      "entregado",
      "esperado_bs",
      "pagado_bs",
      "faltante_bs",
      "origen",
    ];
    const lines = data.purchases.map((p) => {
      const expected = (p.amountCents || 0) / 100;
      const paid = (p.paidAmountCents ?? 0) / 100;
      return [
        p.buyOrder,
        p.createdAt,
        p.name,
        p.email,
        p.status,
        p.delivered ? "si" : "no",
        expected.toFixed(2),
        p.paidAmountCents === undefined ? "" : paid.toFixed(2),
        p.paidAmountCents === undefined
          ? ""
          : Math.max(0, expected - paid).toFixed(2),
        p.source ?? "",
      ]
        .map(csvEscape)
        .join(";");
    });
    const csv = [header.join(";"), ...lines].join("\n");
    return new NextResponse(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="mesa-serena-compras.csv"',
      },
    });
  }

  const paid = data.purchases.filter((p) => p.status === "paid");
  const stats = {
    total: data.purchases.length,
    paid: paid.length,
    delivered: data.purchases.filter((p) => p.delivered).length,
    underpaid: data.purchases.filter((p) => p.status === "underpaid").length,
    pending: data.purchases.filter(
      (p) => p.status !== "paid" && p.status !== "underpaid",
    ).length,
    revenueCents: paid.reduce(
      (sum, p) => sum + (p.paidAmountCents ?? p.amountCents ?? 0),
      0,
    ),
    webhookEvents: data.webhookEvents.length,
  };

  return NextResponse.json({
    storage: data.storage,
    databaseConfigured: dbEnabled(),
    stats,
    purchases: data.purchases,
    webhookEvents: data.webhookEvents,
  });
}
