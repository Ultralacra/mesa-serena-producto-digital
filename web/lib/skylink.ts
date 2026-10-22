import { createHmac } from "crypto";
import { sessionIdForCustomer } from "@/lib/customer";

const paid = new Set(["approved", "paid", "completed", "success", "authorized"]);

export function skylinkConfigured() {
  return Boolean(
    process.env.SKYLINK_COMMERCE_CODE?.trim() && process.env.SKYLINK_API_KEY?.trim(),
  );
}

function apiBase() {
  return (process.env.SKYLINK_API_URL || "https://dev-axis-payment.valinkgroup.com").replace(
    /\/$/,
    "",
  );
}

function canonical(body: Record<string, unknown> | null) {
  if (!body) return "null";
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(body).sort()) {
    if (body[key] !== undefined) sorted[key] = body[key];
  }
  return JSON.stringify(sorted);
}

async function skylinkRequest(
  method: string,
  path: string,
  body?: Record<string, unknown>,
) {
  const commerce = process.env.SKYLINK_COMMERCE_CODE?.trim() ?? "";
  const apiKey = process.env.SKYLINK_API_KEY?.trim() ?? "";
  if (!commerce || !apiKey) {
    throw new Error("Falta SKYLINK_COMMERCE_CODE o SKYLINK_API_KEY.");
  }

  const canonicalBody = canonical(body ?? null);
  const timestamp = Date.now().toString();
  const signedPath = path.split("?")[0];
  const raw = `${method.toUpperCase()}\n${signedPath}\n${timestamp}\n${canonicalBody}`;
  const signature = createHmac("sha256", apiKey).update(raw).digest("hex");
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Api-Key": apiKey,
    "X-Commerce-Code": commerce,
    "X-Commerce-Id": commerce,
    "X-Timestamp": timestamp,
    "X-Signature": signature,
  };

  let httpBody: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    headers["Content-Type"] = "application/json";
    headers["Idempotency-Key"] = `${String(body?.buyOrder || "req")}-${timestamp}`;
    httpBody = canonicalBody;
  }

  const response = await fetch(`${apiBase()}${path}`, {
    method,
    headers,
    body: httpBody,
    cache: "no-store",
  });
  const text = await response.text();
  const parsed = text
    ? (JSON.parse(text) as { success?: boolean; message?: string; data?: unknown })
    : {};
  if (!response.ok || parsed.success === false) {
    throw new Error(parsed.message || `Skylink Pay respondió ${response.status}.`);
  }
  return (parsed.data ?? parsed) as Record<string, unknown>;
}

let cachedRate: { rate: number; at: number } | null = null;

export async function bcvRate() {
  if (cachedRate && Date.now() - cachedRate.at < 60_000) return cachedRate.rate;
  const data = await skylinkRequest("GET", "/api/v1/merchant/rates/bcv");
  const raw = data.raw as { tipocambio?: number } | undefined;
  const rate = Number(raw?.tipocambio ?? data.rate);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Skylink Pay no devolvió una tasa BCV válida.");
  }
  cachedRate = { rate, at: Date.now() };
  return rate;
}

export async function createSkylinkCharge(input: {
  amountCents: number;
  buyOrder: string;
  sessionId: string;
  customerName?: string;
  customerEmail?: string;
}) {
  const sessionId = input.customerEmail
    ? sessionIdForCustomer(input.customerName || "", input.customerEmail)
    : input.sessionId;
  const data = await skylinkRequest("POST", "/api/v1/merchant/transactions", {
    amount: input.amountCents,
    buyOrder: input.buyOrder,
    currency: "VES",
    expirable: true,
    installments: 1,
    sessionId,
  });
  const token = String(data.token ?? data.paymentToken ?? "");
  const url = String(data.url ?? (token ? `${apiBase()}/pay/${token}` : ""));
  if (!url) throw new Error("Skylink Pay no devolvió la página de pago.");
  return {
    url,
    token,
    sessionId,
    id: String(data.id ?? ""),
    status: String(data.status ?? "created"),
    cents: input.amountCents,
    ves: input.amountCents / 100,
  };
}

export async function readSkylinkCharge(token: string) {
  const data = await skylinkRequest(
    "GET",
    `/api/v1/merchant/transactions/token/${encodeURIComponent(token)}`,
  );
  const status = String(data.status ?? data.state ?? "").toLowerCase();
  return { status, paid: paid.has(status), data };
}

export function isPaidStatus(status: string) {
  return paid.has(status.toLowerCase());
}

export type SkylinkTransaction = {
  buyOrder: string;
  sessionId?: string;
  token?: string;
  amount?: number;
  paidAmount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Estado de Skylink traducido al que muestra el admin. */
export function purchaseStatusFromSkylink(status: string) {
  const value = status.toLowerCase();
  if (paid.has(value)) return "paid";
  if (value === "needs_review") return "underpaid";
  if (value === "expired") return "expired";
  if (value === "cancelled" || value === "canceled") return "cancelled";
  if (value === "failed") return "failed";
  return "created";
}

/** Todas las transacciones del comercio. El mismo endpoint del cobro, en GET. */
export async function listSkylinkTransactions() {
  const items: SkylinkTransaction[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const data = await skylinkRequest(
      "GET",
      `/api/v1/merchant/transactions?limit=100&page=${page}`,
    );
    const batch = Array.isArray(data.items) ? data.items : [];
    for (const raw of batch) {
      const item = raw as Record<string, unknown>;
      const buyOrder = String(item.buyOrder ?? "");
      if (!buyOrder) continue;
      items.push({
        buyOrder,
        sessionId: item.sessionId ? String(item.sessionId) : undefined,
        token: item.token ? String(item.token) : undefined,
        amount: item.amount === undefined ? undefined : Number(item.amount),
        paidAmount:
          item.paidAmount === undefined ? undefined : Number(item.paidAmount),
        status: item.status ? String(item.status) : undefined,
        createdAt: item.createdAt ? String(item.createdAt) : undefined,
        updatedAt: item.updatedAt ? String(item.updatedAt) : undefined,
      });
    }
    const pagination = data.pagination as { totalPages?: number } | undefined;
    const totalPages = Number(pagination?.totalPages ?? 1);
    if (page >= totalPages || batch.length === 0) break;
  }
  return items;
}
