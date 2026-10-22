import { formatVes } from "@/lib/product";
import { isPaidStatus } from "@/lib/skylink";

/**
 * Decisión de entrega según lo que la persona pagó de verdad.
 *
 * - Pagó completo o de más: entrega.
 * - Pagó de menos por un faltante mínimo (centavos / redondeo al escribir
 *   el monto en pago móvil): entrega igual. Tolerancia: 1 % del monto,
 *   con un mínimo de 1,00 Bs (100 céntimos).
 * - Pagó mucho menos: NO se entrega. Se avisa por correo y en /gracias.
 */
export type PaymentEvaluation = {
  state: "approved" | "underpaid" | "pending";
  deliver: boolean;
  expectedCents: number;
  paidCents: number | null;
  missingCents: number;
  toleranceCents: number;
  withinTolerance: boolean;
};

export function toleranceCentsFor(expectedCents: number) {
  if (!expectedCents || expectedCents <= 0) return 100;
  return Math.max(100, Math.round(expectedCents * 0.01));
}

export function evaluatePayment(input: {
  status?: string;
  resultCode?: string;
  expectedCents: number;
  paidCents?: number | null;
}): PaymentEvaluation {
  const expectedCents = Math.max(0, Math.round(input.expectedCents || 0));
  const paidCents =
    input.paidCents === null || input.paidCents === undefined || Number.isNaN(Number(input.paidCents))
      ? null
      : Math.round(Number(input.paidCents));
  const toleranceCents = toleranceCentsFor(expectedCents);
  const missingCents =
    paidCents !== null && expectedCents > 0 ? Math.max(0, expectedCents - paidCents) : 0;
  const withinTolerance = missingCents > 0 && missingCents <= toleranceCents;

  const status = (input.status ?? "").toLowerCase();
  const resultCode = (input.resultCode ?? "").toUpperCase();
  const approvedStatus = isPaidStatus(status) || resultCode === "APPROVED";
  const mismatch = status === "needs_review" || resultCode === "MONTO_NO_COINCIDE";

  if (paidCents !== null && missingCents > toleranceCents && (approvedStatus || mismatch)) {
    return {
      state: "underpaid",
      deliver: false,
      expectedCents,
      paidCents,
      missingCents,
      toleranceCents,
      withinTolerance: false,
    };
  }

  if (approvedStatus) {
    return {
      state: "approved",
      deliver: true,
      expectedCents,
      paidCents,
      missingCents,
      toleranceCents,
      withinTolerance,
    };
  }

  if (mismatch) {
    if (paidCents !== null && missingCents <= toleranceCents) {
      // Faltante mínimo o nulo en revisión: se entrega igual.
      return {
        state: "approved",
        deliver: true,
        expectedCents,
        paidCents,
        missingCents,
        toleranceCents,
        withinTolerance: missingCents > 0,
      };
    }
    if (paidCents !== null) {
      return {
        state: "underpaid",
        deliver: false,
        expectedCents,
        paidCents,
        missingCents,
        toleranceCents,
        withinTolerance: false,
      };
    }
  }

  return {
    state: "pending",
    deliver: false,
    expectedCents,
    paidCents,
    missingCents,
    toleranceCents,
    withinTolerance,
  };
}

export function bsFromCents(cents: number | null | undefined) {
  if (cents === null || cents === undefined) return "—";
  return formatVes(cents / 100);
}
