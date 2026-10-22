import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Base de datos duradera (Neon Postgres, vía Vercel).
 * Sin DATABASE_URL el registro vive solo en el archivo local (.data/),
 * que en Vercel NO persiste: por eso en producción esta variable es clave.
 */

let client: NeonQueryFunction<false, false> | null = null;
let ensured: Promise<void> | null = null;

export function dbEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

function sql() {
  if (!client) client = neon(process.env.DATABASE_URL!);
  return client;
}

async function ensureTables() {
  const q = sql();
  await q`
    CREATE TABLE IF NOT EXISTS purchases (
      buy_order TEXT PRIMARY KEY,
      session_id TEXT,
      token TEXT,
      name TEXT,
      email TEXT,
      amount_cents INTEGER NOT NULL DEFAULT 0,
      paid_amount_cents INTEGER,
      status TEXT NOT NULL DEFAULT 'created',
      delivered BOOLEAN NOT NULL DEFAULT FALSE,
      underpaid_notified BOOLEAN NOT NULL DEFAULT FALSE,
      source TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      paid_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await q`
    CREATE TABLE IF NOT EXISTS webhook_events (
      id TEXT PRIMARY KEY,
      received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      event_type TEXT,
      buy_order TEXT,
      skylink_status TEXT,
      result_code TEXT,
      result_message TEXT,
      amount_cents INTEGER,
      paid_amount_cents INTEGER,
      currency TEXT,
      decision TEXT,
      customer_name TEXT,
      customer_email TEXT,
      raw JSONB
    )`;
  await q`ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS customer_name TEXT`;
  await q`ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS customer_email TEXT`;
}

export async function ensureDb() {
  if (!dbEnabled()) return;
  if (!ensured) {
    ensured = ensureTables().catch((error) => {
      ensured = null;
      throw error;
    });
  }
  await ensured;
}

export type PurchaseRow = {
  buy_order: string;
  session_id: string | null;
  token: string | null;
  name: string | null;
  email: string | null;
  amount_cents: number;
  paid_amount_cents: number | null;
  status: string;
  delivered: boolean;
  underpaid_notified: boolean;
  source: string | null;
  created_at: string;
  paid_at: string | null;
  updated_at: string;
};

export type WebhookEventRow = {
  id: string;
  received_at: string;
  event_type: string | null;
  buy_order: string | null;
  skylink_status: string | null;
  result_code: string | null;
  result_message: string | null;
  amount_cents: number | null;
  paid_amount_cents: number | null;
  currency: string | null;
  decision: string | null;
  customer_name: string | null;
  customer_email: string | null;
  raw: unknown;
};

export async function dbUpsertPurchase(p: {
  buyOrder: string;
  sessionId?: string;
  token?: string;
  name?: string;
  email?: string;
  amountCents: number;
  paidAmountCents?: number | null;
  status: string;
  delivered?: boolean;
  underpaidNotified?: boolean;
  source?: string;
  createdAt?: string;
}) {
  await ensureDb();
  const q = sql();
  await q`
    INSERT INTO purchases (
      buy_order, session_id, token, name, email, amount_cents,
      paid_amount_cents, status, delivered, underpaid_notified, source,
      created_at, paid_at, updated_at
    ) VALUES (
      ${p.buyOrder}, ${p.sessionId ?? null}, ${p.token ?? null},
      ${p.name ?? null}, ${p.email ?? null}, ${p.amountCents},
      ${p.paidAmountCents ?? null}, ${p.status}, ${p.delivered ?? false},
      ${p.underpaidNotified ?? false}, ${p.source ?? null},
      ${p.createdAt ?? new Date().toISOString()},
      ${p.status === "paid" ? new Date().toISOString() : null},
      now()
    )
    ON CONFLICT (buy_order) DO UPDATE SET
      session_id = COALESCE(EXCLUDED.session_id, purchases.session_id),
      token = COALESCE(EXCLUDED.token, purchases.token),
      name = COALESCE(NULLIF(EXCLUDED.name, ''), purchases.name),
      email = COALESCE(NULLIF(EXCLUDED.email, ''), purchases.email),
      amount_cents = CASE WHEN EXCLUDED.amount_cents > 0 THEN EXCLUDED.amount_cents ELSE purchases.amount_cents END,
      paid_amount_cents = COALESCE(EXCLUDED.paid_amount_cents, purchases.paid_amount_cents),
      status = EXCLUDED.status,
      delivered = purchases.delivered OR EXCLUDED.delivered,
      underpaid_notified = purchases.underpaid_notified OR EXCLUDED.underpaid_notified,
      source = COALESCE(EXCLUDED.source, purchases.source),
      paid_at = COALESCE(purchases.paid_at, EXCLUDED.paid_at),
      updated_at = now()`;
}

export async function dbRecordWebhookEvent(e: {
  id: string;
  eventType?: string;
  buyOrder?: string;
  skylinkStatus?: string;
  resultCode?: string;
  resultMessage?: string;
  amountCents?: number | null;
  paidAmountCents?: number | null;
  currency?: string;
  decision?: string;
  customerName?: string;
  customerEmail?: string;
  raw: unknown;
}) {
  await ensureDb();
  const q = sql();
  await q`
    INSERT INTO webhook_events (
      id, event_type, buy_order, skylink_status, result_code, result_message,
      amount_cents, paid_amount_cents, currency, decision, customer_name,
      customer_email, raw
    ) VALUES (
      ${e.id}, ${e.eventType ?? null}, ${e.buyOrder ?? null},
      ${e.skylinkStatus ?? null}, ${e.resultCode ?? null},
      ${e.resultMessage ?? null}, ${e.amountCents ?? null},
      ${e.paidAmountCents ?? null}, ${e.currency ?? null},
      ${e.decision ?? null}, ${e.customerName ?? null},
      ${e.customerEmail ?? null}, ${JSON.stringify(e.raw ?? {})}::jsonb
    )
    ON CONFLICT (id) DO NOTHING`;
}

export async function dbFindPurchase(buyOrder: string) {
  await ensureDb();
  const q = sql();
  const rows = (await q`
    SELECT * FROM purchases WHERE buy_order = ${buyOrder} LIMIT 1
  `) as unknown as PurchaseRow[];
  return rows[0] ?? null;
}

export async function dbListPurchases(limit = 300) {
  await ensureDb();
  const q = sql();
  return (await q`
    SELECT * FROM purchases ORDER BY created_at DESC LIMIT ${limit}
  `) as unknown as PurchaseRow[];
}

export async function dbListWebhookEvents(limit = 300) {
  await ensureDb();
  const q = sql();
  return (await q`
    SELECT * FROM webhook_events ORDER BY received_at DESC LIMIT ${limit}
  `) as unknown as WebhookEventRow[];
}
