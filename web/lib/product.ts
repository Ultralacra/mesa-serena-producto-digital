const priceFromEnv = Number(process.env.NEXT_PUBLIC_PRICE_USD);
const compareFromEnv = Number(process.env.NEXT_PUBLIC_COMPARE_USD);

export const PRODUCT = {
  name: "Mesa Serena",
  priceUsd: Number.isFinite(priceFromEnv) && priceFromEnv > 0 ? priceFromEnv : 5,
};

/** Ancla de precio (tachado) y cierre real del lanzamiento — hora Venezuela (−04:00). */
export const OFFER = {
  compareAtUsd:
    Number.isFinite(compareFromEnv) && compareFromEnv > PRODUCT.priceUsd
      ? compareFromEnv
      : 7,
  label: "Precio de lanzamiento",
  endsAtIso:
    process.env.NEXT_PUBLIC_LAUNCH_ENDS_AT?.trim() ||
    "2026-10-23T23:59:59-04:00",
};

export const WHATSAPP_URL =
  "https://wa.me/56937761679?text=" +
    encodeURIComponent("Hola, quiero mi recetario de Mesa Serena.");

export function isLaunchOfferActive(now = Date.now()) {
  const ends = Date.parse(OFFER.endsAtIso);
  return Number.isFinite(ends) && now < ends;
}

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
