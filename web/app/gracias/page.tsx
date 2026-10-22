import { Suspense } from "react";
import { ReturnView } from "@/components/ReturnView";
import { RECETARIO_URL } from "@/lib/receipt-email";

export const metadata = { title: "Gracias — Mesa Serena" };

export default function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<p className="return-msg">Consultando el pago…</p>}>
      <Body searchParams={searchParams} />
    </Suspense>
  );
}

async function Body({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <ReturnView
      token={first(params.token) || first(params.paymentToken)}
      buyOrder={first(params.buyOrder) || first(params.order) || first(params.buy_order)}
      downloadUrl={RECETARIO_URL}
    />
  );
}

function first(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
}
