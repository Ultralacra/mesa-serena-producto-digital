import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

export type Order = {
  buyOrder: string;
  sessionId: string;
  token: string;
  name: string;
  email: string;
  amountCents: number;
  status: "created" | "paid";
  delivered: boolean;
  createdAt: string;
};

const file = join(process.cwd(), ".data", "orders.json");
const memory = new Map<string, Order>();

function load(): Order[] {
  try {
    const raw = JSON.parse(readFileSync(file, "utf8")) as Order[];
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [...memory.values()];
  }
}

function save(orders: Order[]) {
  memory.clear();
  for (const order of orders) {
    memory.set(order.buyOrder, order);
    if (order.token) memory.set(order.token, order);
  }
  try {
    mkdirSync(join(process.cwd(), ".data"), { recursive: true });
    writeFileSync(file, JSON.stringify(orders, null, 2));
  } catch {
    // En Vercel el disco no persiste; la memoria cubre el proceso actual.
  }
}

export function saveOrder(order: Order) {
  const orders = load().filter(
    (item) => item.buyOrder !== order.buyOrder && item.token !== order.token,
  );
  orders.push(order);
  save(orders);
}

export function findOrder(id: string) {
  if (memory.has(id)) return memory.get(id);
  return load().find((item) => item.buyOrder === id || item.token === id);
}

export function markPaid(id: string) {
  const orders = load();
  const match = orders.find((item) => item.buyOrder === id || item.token === id);
  if (!match) return null;
  match.status = "paid";
  save(orders);
  return match;
}

export function markDelivered(id: string) {
  const orders = load();
  const match = orders.find((item) => item.buyOrder === id || item.token === id);
  if (!match) return null;
  match.delivered = true;
  match.status = "paid";
  save(orders);
  return match;
}
