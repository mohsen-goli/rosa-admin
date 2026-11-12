import type { DatabaseOrder } from "../types/databaseOrder";

export interface Customer {
  id: string;
  email: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: "vip" | "regular" | "new";
}

export function extractCustomers(orders: DatabaseOrder[]): Customer[] {
  const map = new Map<string, Customer>();

  orders.forEach((order) => {
    const email = order.customerEmail?.trim().toLowerCase() ?? "";
    const phone = order.customerPhone?.trim() ?? "";
    const key = email || phone || order.id;
    const existing = map.get(key);
    const isRevenueOrder =
      order.status !== "cancelled" && order.paymentStatus === "paid";

    if (existing) {
      existing.totalOrders += 1;
      if (isRevenueOrder) existing.totalSpent += order.total;
      if (order.createdAt > existing.lastOrderDate) {
        existing.lastOrderDate = order.createdAt;
      }
    } else {
      map.set(key, {
        id: key,
        email: order.customerEmail?.trim() || phone || "No contact",
        name: order.customerName,
        totalOrders: 1,
        totalSpent: isRevenueOrder ? order.total : 0,
        lastOrderDate: order.createdAt,
        status: "new",
      });
    }
  });

  const customers = Array.from(map.values());

  customers.forEach((customer) => {
    if (customer.totalSpent > 1500000) {
      customer.status = "vip";
    } else if (customer.totalOrders >= 3) {
      customer.status = "regular";
    } else {
      customer.status = "new";
    }
  });

  return customers.sort((a, b) => b.totalSpent - a.totalSpent);
}
