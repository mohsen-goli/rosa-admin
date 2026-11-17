import { useEffect, useMemo, useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { OrdersTable } from "../features/orders/OrdersTable";
import { supabase } from "../lib/supabase";
import type { DatabaseOrder, DatabaseOrderStatus } from "../types/databaseOrder";

interface OrderRow {
  id: string;
  code: string;
  market: string;
  currency: "IRR" | "USD";
  status: DatabaseOrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  customer: {
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    address?: string;
    postal?: string;
    note?: string;
  };
  created_at: string;
  order_items: {
    id: string;
    product_id: string | null;
    product_snapshot: {
      title?: { fa?: string; en?: string; ar?: string };
      brand?: string;
      variant?: { name?: string; title?: string } | null;
    } | null;
    unit_price: number;
    quantity: number;
    line_total: number;
  }[];
}

export function Orders() {
  const [orders, setOrders] = useState<DatabaseOrder[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DatabaseOrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id, code, market, currency, status, subtotal, shipping, total,
        customer, created_at,
        order_items (
          id, product_id, product_snapshot, unit_price, quantity, line_total
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Orders fetch error:", error);
      setError(error.message);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as unknown as OrderRow[];
    const mappedOrders: DatabaseOrder[] = rows.map((row) => ({
      id: row.id,
      orderCode: row.code,
      customerName: row.customer?.name ?? "—",
      customerEmail: row.customer?.email ?? null,
      customerPhone: row.customer?.phone ?? null,
      shippingAddress: [row.customer?.city, row.customer?.address, row.customer?.postal].filter(Boolean).join(" — "),
      status: row.status,
      paymentStatus: "unpaid",
      currency: row.currency,
      subtotal: Number(row.subtotal),
      shippingFee: Number(row.shipping),
      total: Number(row.total),
      createdAt: row.created_at,
      items: (row.order_items ?? []).map((item) => ({
        id: item.id,
        productId: item.product_id,
        productName:
          item.product_snapshot?.title?.fa ??
          item.product_snapshot?.title?.en ??
          item.product_snapshot?.title?.ar ??
          item.product_snapshot?.brand ??
          item.product_id ??
          "Product",
        unitPrice: Number(item.unit_price),
        quantity: Number(item.quantity),
        lineTotal: Number(item.line_total),
      })),
    }));

    setOrders(mappedOrders);
    setLoading(false);
  }

  function handleRefresh() {
    setLoading(true);
    setError(null);
    void fetchOrders();
  }

  useEffect(() => {
    void fetchOrders();
  }, []);

  async function handleStatusChange(orderId: string, newStatus: DatabaseOrderStatus) {
    const previousOrders = orders;
    const previousStatus = orders.find((order) => order.id === orderId)?.status;
    if (!previousStatus || previousStatus === newStatus) return;

    setUpdatingOrderId(orderId);
    setError(null);
    const { error } = await supabase.rpc("admin_update_order_status", {
      p_order_id: orderId,
      p_status: newStatus,
    });

    if (error) {
      console.error("Order status update error:", error);
      setError(`Could not update order status: ${error.message}`);
      setOrders(previousOrders);
    } else {
      setOrders((current) => current.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    }
    setUpdatingOrderId(null);
  }

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();
    return orders.filter((order) => {
      const matchesSearch =
        order.customerName.toLowerCase().includes(normalizedSearch) ||
        (order.customerEmail ?? "").toLowerCase().includes(normalizedSearch) ||
        order.orderCode.toLowerCase().includes(normalizedSearch) ||
        order.items.some((item) => item.productName.toLowerCase().includes(normalizedSearch));
      return matchesSearch && (statusFilter === "all" || order.status === statusFilter);
    });
  }, [orders, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Orders</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{filteredOrders.length} of {orders.length} orders</p>
        </div>
        <button type="button" onClick={handleRefresh} disabled={loading} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by customer, product or order code..." className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500" />
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as DatabaseOrderStatus | "all")} className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
      {loading ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-sm text-slate-500">Loading orders...</div>
      ) : (
        <OrdersTable orders={filteredOrders} onStatusChange={handleStatusChange} updatingOrderId={updatingOrderId} />
      )}
    </div>
  );
}
