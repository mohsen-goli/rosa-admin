import type { Order } from "../types/order";

export interface Customer {
  email: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: "vip" | "regular" | "new";
}

export function extractCustomers(orders: Order[]): Customer[] {
  const map = new Map<string, Customer>();

  orders.forEach((order) => {
    const existing = map.get(order.customerEmail);

    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += order.amount;

      if (order.date > existing.lastOrderDate) {
        existing.lastOrderDate = order.date;
      }
    } else {
      map.set(order.customerEmail, {
        email: order.customerEmail,
        name: order.customerName,
        totalOrders: 1,
        totalSpent: order.amount,
        lastOrderDate: order.date,
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
