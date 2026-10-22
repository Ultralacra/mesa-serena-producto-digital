import { NextResponse } from "next/server";
import { PRODUCT } from "@/lib/product";
import { bcvRate } from "@/lib/skylink";

export async function GET() {
  try {
    const rate = await bcvRate();
    return NextResponse.json({
      rate,
      priceUsd: PRODUCT.priceUsd,
      equivalentVes: Math.round(PRODUCT.priceUsd * rate * 100) / 100,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "No se pudo leer la tasa BCV." },
      { status: 502 },
    );
  }
}
