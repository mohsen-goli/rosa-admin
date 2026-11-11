import type { DatabaseOrder } from "../types/databaseOrder";

export function calculateStats(orders: DatabaseOrder[]) {
  const activeOrders = orders.filter((order) => order.status !== "cancelled");
  const totalOrders = orders.length;
  const totalRevenue = activeOrders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.total, 0);

  const customerKeys = new Set(
    orders.map((order) => {
      const email = order.customerEmail?.trim().toLowerCase();
      const phone = order.customerPhone?.trim();
      return email || phone || order.id;
    }),
  );

  const totalProducts = activeOrders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );

  return {
    totalOrders,
    totalRevenue,
    uniqueCustomers: customerKeys.size,
    totalProducts,
  };
}
