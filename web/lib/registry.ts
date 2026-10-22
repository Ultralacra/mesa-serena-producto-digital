import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import {
  dbEnabled,
  dbFindPurchase,
  dbListPurchases,
  dbListWebhookEvents,
  dbRecordWebhookEvent,
  dbUpsertPurchase,
} from "@/lib/db";
import { listOrders } from "@/lib/orders";
import { logFlow } from "@/lib/log";

/**
 * Registro de compras y de webhooks: lo que el admin lee.
 * Guarda SIEMPRE en local (.data/) y, si hay DATABASE_URL (Neon en Vercel),
 * también en la base duradera. Nunca lanza: un fallo de registro jamás
 * debe tumbar un pago ni una entrega.
 */

export type PurchaseRecord = {
  buyOrder: string;
  sessionId?: string;
  token?: string;
  name: string;
  email: string;
  amountCents: number;
  paidAmountCents?: number;
  status: string;
  delivered: boolean;
  underpaidNotified?: boolean;
  source?: string;
  createdAt: string;
  paidAt?: string;
  updatedAt: string;
};

export type WebhookEventRecord = {
  id: string;
  receivedAt: string;
  eventType?: string;
  buyOrder?: string;
  skylinkStatus?: string;
  resultCode?: string;
  resultMessage?: string;
  amountCents?: number;
  paidAmountCents?: number;
  currency?: string;
  decision?: string;
  raw: unknown;
};

const dir = join(process.cwd(), ".data");
const purchasesFile = join(dir, "purchases.json");
const eventsFile = join(dir, "webhook-events.json");

function readJson<T>(file: string, fallback: T): T {
  try {
    const raw = JSON.parse(readFileSync(file, "utf8")) as T;
    return raw ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, data: unknown) {
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, JSON.stringify(data, null, 2));
  } catch {
    // En Vercel el disco no persiste; la base Neon cubre producción.
  }
}

function localPurchases(): PurchaseRecord[] {
  const data = readJson<PurchaseRecord[]>(purchasesFile, []);
  return Array.isArray(data) ? data : [];
}

function localEvents(): WebhookEventRecord[] {
  const data = readJson<WebhookEventRecord[]>(eventsFile, []);
  return Array.isArray(data) ? data : [];
}

const statusRank: Record<string, number> = {
  created: 1,
  pending: 1,
  underpaid: 2,
  paid: 3,
};

function mergePurchase(
  base: PurchaseRecord | undefined,
  next: PurchaseRecord,
): PurchaseRecord {
  if (!base) return next;
  const winner =
    (statusRank[next.status] ?? 0) > (statusRank[base.status] ?? 0)
      ? next
      : base;
  const loser = winner === next ? base : next;
  return {
    ...loser,
    ...winner,
    name: winner.name || loser.name || "",
    email: winner.email || loser.email || "",
    amountCents: winner.amountCents || loser.amountCents || 0,
    paidAmountCents: winner.paidAmountCents ?? loser.paidAmountCents,
    delivered: Boolean(base.delivered || next.delivered),
    underpaidNotified: Boolean(
      base.underpaidNotified || next.underpaidNotified,
    ),
    createdAt:
      base.createdAt < next.createdAt ? base.createdAt : next.createdAt,
    updatedAt:
      base.updatedAt > next.updatedAt ? base.updatedAt : next.updatedAt,
  };
}

export async function recordPurchase(
  input: Partial<PurchaseRecord> & { buyOrder: string; status: string },
) {
  const now = new Date().toISOString();
  const record: PurchaseRecord = {
    buyOrder: input.buyOrder,
    sessionId: input.sessionId,
    token: input.token,
    name: input.name ?? "",
    email: input.email ?? "",
    amountCents: input.amountCents ?? 0,
    paidAmountCents: input.paidAmountCents,
    status: input.status,
    delivered: Boolean(input.delivered),
    underpaidNotified: input.underpaidNotified,
    source: input.source,
    createdAt: input.createdAt ?? now,
    paidAt:
      input.paidAt ?? (input.status === "paid" ? now : undefined),
    updatedAt: now,
  };

  try {
    const all = localPurchases();
    const existing = all.find((p) => p.buyOrder === record.buyOrder);
    const merged = mergePurchase(existing, record);
    writeJson(purchasesFile, [
      merged,
      ...all.filter((p) => p.buyOrder !== record.buyOrder),
    ]);
  } catch (error) {
    logFlow("REGISTRO · falló guardar la compra en local", {
      buyOrder: record.buyOrder,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  if (dbEnabled()) {
    try {
      await dbUpsertPurchase(record);
    } catch (error) {
      logFlow("REGISTRO · falló guardar la compra en Neon", {
        buyOrder: record.buyOrder,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return record;
}

export async function recordWebhookEvent(
  input: Omit<WebhookEventRecord, "id" | "receivedAt"> &
    Partial<Pick<WebhookEventRecord, "id" | "receivedAt">>,
) {
  const event: WebhookEventRecord = {
    ...input,
    id: input.id ?? randomUUID(),
    receivedAt: input.receivedAt ?? new Date().toISOString(),
  };

  try {
    const all = localEvents();
    if (!all.some((e) => e.id === event.id)) {
      writeJson(eventsFile, [event, ...all].slice(0, 1000));
    }
  } catch (error) {
    logFlow("REGISTRO · falló guardar el webhook en local", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  if (dbEnabled()) {
    try {
      await dbRecordWebhookEvent(event);
    } catch (error) {
      logFlow("REGISTRO · falló guardar el webhook en Neon", {
        buyOrder: event.buyOrder,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return event;
}

/** Busca una compra por buyOrder: local primero, Neon después. */
export async function findPurchaseRecord(buyOrder: string) {
  if (!buyOrder) return null;
  const local =
    localPurchases().find((p) => p.buyOrder === buyOrder) ??
    listOrders()
      .filter((o) => o.buyOrder === buyOrder)
      .map(orderToPurchase)[0];
  if (local?.email) return local;

  if (dbEnabled()) {
    try {
      const row = await dbFindPurchase(buyOrder);
      if (row) {
        return {
          buyOrder: row.buy_order,
          sessionId: row.session_id ?? undefined,
          token: row.token ?? undefined,
          name: row.name ?? "",
          email: row.email ?? "",
          amountCents: row.amount_cents,
          paidAmountCents: row.paid_amount_cents ?? undefined,
          status: row.status,
          delivered: row.delivered,
          underpaidNotified: row.underpaid_notified,
          source: row.source ?? undefined,
          createdAt: new Date(row.created_at).toISOString(),
          paidAt: row.paid_at
            ? new Date(row.paid_at).toISOString()
            : undefined,
          updatedAt: new Date(row.updated_at).toISOString(),
        } satisfies PurchaseRecord;
      }
    } catch (error) {
      logFlow("REGISTRO · falló buscar la compra en Neon", {
        buyOrder,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return local ?? null;
}

function orderToPurchase(
  o: ReturnType<typeof listOrders>[number],
): PurchaseRecord {
  return {
    buyOrder: o.buyOrder,
    sessionId: o.sessionId,
    token: o.token || undefined,
    name: o.name,
    email: o.email,
    amountCents: o.amountCents,
    paidAmountCents: o.paidAmountCents,
    status: o.status,
    delivered: o.delivered,
    underpaidNotified: o.underpaidNotified,
    source: "checkout",
    createdAt: o.createdAt,
    paidAt: o.status === "paid" ? o.createdAt : undefined,
    updatedAt: o.createdAt,
  };
}

export async function listAdminData() {
  const byOrder = new Map<string, PurchaseRecord>();
  for (const p of localPurchases()) {
    byOrder.set(p.buyOrder, mergePurchase(byOrder.get(p.buyOrder), p));
  }
  for (const o of listOrders()) {
    const p = orderToPurchase(o);
    byOrder.set(p.buyOrder, mergePurchase(byOrder.get(p.buyOrder), p));
  }

  let storage: "neon" | "local" = dbEnabled() ? "neon" : "local";
  let dbEvents: WebhookEventRecord[] = [];

  if (dbEnabled()) {
    try {
      const rows = await dbListPurchases();
      for (const row of rows) {
        const p: PurchaseRecord = {
          buyOrder: row.buy_order,
          sessionId: row.session_id ?? undefined,
          token: row.token ?? undefined,
          name: row.name ?? "",
          email: row.email ?? "",
          amountCents: row.amount_cents,
          paidAmountCents: row.paid_amount_cents ?? undefined,
          status: row.status,
          delivered: row.delivered,
          underpaidNotified: row.underpaid_notified,
          source: row.source ?? undefined,
          createdAt: new Date(row.created_at).toISOString(),
          paidAt: row.paid_at
            ? new Date(row.paid_at).toISOString()
            : undefined,
          updatedAt: new Date(row.updated_at).toISOString(),
        };
        byOrder.set(p.buyOrder, mergePurchase(byOrder.get(p.buyOrder), p));
      }
      const eventRows = await dbListWebhookEvents();
      dbEvents = eventRows.map((row) => ({
        id: row.id,
        receivedAt: new Date(row.received_at).toISOString(),
        eventType: row.event_type ?? undefined,
        buyOrder: row.buy_order ?? undefined,
        skylinkStatus: row.skylink_status ?? undefined,
        resultCode: row.result_code ?? undefined,
        resultMessage: row.result_message ?? undefined,
        amountCents: row.amount_cents ?? undefined,
        paidAmountCents: row.paid_amount_cents ?? undefined,
        currency: row.currency ?? undefined,
        decision: row.decision ?? undefined,
        raw: row.raw,
      }));
    } catch (error) {
      storage = "local";
      logFlow("REGISTRO · Neon no respondió, se usa el registro local", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const eventsById = new Map<string, WebhookEventRecord>();
  for (const e of [...dbEvents, ...localEvents()]) {
    if (!eventsById.has(e.id)) eventsById.set(e.id, e);
  }

  const purchases = [...byOrder.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  const webhookEvents = [...eventsById.values()].sort((a, b) =>
    b.receivedAt.localeCompare(a.receivedAt),
  );

  return { storage, purchases, webhookEvents };
}
