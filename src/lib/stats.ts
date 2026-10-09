import type { Order } from "../types/order";

export function calculateStats(orders: Order[]) {
  const totalOrders = orders.length;

  const totalRevenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.amount, 0);

  const uniqueCustomers = new Set(orders.map((order) => order.customerEmail))
    .size;

  const totalProducts = orders.reduce((sum, order) => sum + order.items, 0);

  return {
    totalOrders,
    totalRevenue,
    uniqueCustomers,
    totalProducts,
  };
}
