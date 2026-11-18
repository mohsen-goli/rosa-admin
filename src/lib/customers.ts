import type { DatabaseOrder } from "../types/databaseOrder";

export interface Customer {
  id: string;
  email: string;
  name: string;
  totalOrders: number;
  spentByCurrency: Record<"IRR" | "USD", number>;
  lastOrderDate: string;
  status: "vip" | "regular" | "new";
}

export function extractCustomers(orders: DatabaseOrder[]): Customer[] {
  const map = new Map<string, Customer>();
  for (const order of orders) {
    const key = order.customerEmail?.trim().toLowerCase() || order.userId || \`guest:\${order.id}\`;
    const existing = map.get(key);
    if (existing) {
      existing.totalOrders += 1;
      existing.spentByCurrency[order.currency] += order.total;
      if (order.createdAt > existing.lastOrderDate) existing.lastOrderDate = order.createdAt;
      if (existing.name === "—" && order.customerName !== "—") existing.name = order.customerName;
    } else {
      map.set(key, {
        id: key,
        email: order.customerEmail || "No email",
        name: order.customerName,
        totalOrders: 1,
        spentByCurrency: { IRR: order.currency === "IRR" ? order.total : 0, USD: order.currency === "USD" ? order.total : 0 },
        lastOrderDate: order.createdAt,
        status: "new",
      });
    }
  }
  return [...map.values()].map((customer) => ({
    ...customer,
    status: customer.totalOrders >= 5 ? "vip" : customer.totalOrders >= 2 ? "regular" : "new",
  })).sort((a, b) => b.totalOrders - a.totalOrders);
}