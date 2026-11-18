import { useMemo, useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { OrdersTable } from "../features/orders/OrdersTable";
import { supabase } from "../lib/supabase";
import { useDatabaseOrders } from "../hooks/useDatabaseOrders";
import type { DatabaseOrderStatus } from "../types/databaseOrder";

export function Orders() {
  const { orders, loading, error, refresh } = useDatabaseOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DatabaseOrderStatus | "all">("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleStatusChange(orderId: string, newStatus: DatabaseOrderStatus) {
    const current = orders.find((order) => order.id === orderId);
    if (!current || current.status === newStatus) return;
    setUpdatingOrderId(orderId);
    setActionError(null);
    const { error: updateError } = await supabase.rpc("admin_update_order_status", {
      p_order_id: orderId,
      p_status: newStatus,
    });
    if (updateError) setActionError(\`Could not update order status: \${updateError.message}\`);
    else await refresh();
    setUpdatingOrderId(null);
  }

  const filteredOrders = useMemo(() => {
    const term = search.toLowerCase().trim();
    return orders.filter((order) => {
      const matches = order.customerName.toLowerCase().includes(term) ||
        (order.customerEmail ?? "").toLowerCase().includes(term) ||
        order.orderCode.toLowerCase().includes(term) ||
        order.items.some((item) => item.productName.toLowerCase().includes(term));
      return matches && (statusFilter === "all" || order.status === statusFilter);
    });
  }, [orders, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Orders</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{filteredOrders.length} of {orders.length} orders</p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by customer, product or order code..." className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500" />
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as DatabaseOrderStatus | "all")} className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200">
          <option value="all">All Statuses</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
        </select>
      </div>
      {(error || actionError) && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{actionError ?? error}</div>}
      {loading ? <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-sm text-slate-500">Loading orders...</div> :
        <OrdersTable orders={filteredOrders} onStatusChange={handleStatusChange} updatingOrderId={updatingOrderId} />}
    </div>
  );
}