export const PRODUCT = {
  name: "Mesa Serena",
  priceUsd: 5,
  testVes: 10,
  testCents: 1000,
};

export function formatVes(n: number) {
  return n.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
