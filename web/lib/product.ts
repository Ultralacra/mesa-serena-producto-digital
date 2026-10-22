const priceFromEnv = Number(process.env.NEXT_PUBLIC_PRICE_USD);

export const PRODUCT = {
  name: "Mesa Serena",
  priceUsd: Number.isFinite(priceFromEnv) && priceFromEnv > 0 ? priceFromEnv : 5,
};

/** Monto real a cobrar en céntimos de bolívar: el precio en USD a la tasa BCV del día. */
export function vesCentsForRate(rate: number) {
  return Math.round(PRODUCT.priceUsd * rate * 100);
}

export function formatVes(n: number) {
  return n.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
