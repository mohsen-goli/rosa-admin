import { Pencil, Trash2 } from "lucide-react";
import type { Order } from "../../types/order";
import { StatusBadge } from "../../components/StatusBadge";

interface OrdersTableProps {
  orders: Order[];
  onDelete: (id: string) => void;
  onEdit: (order: Order) => void;
}

export function OrdersTable({ orders, onDelete, onEdit }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 border border-slate-200 text-center">
        <p className="text-slate-400 text-sm">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-6 py-3 font-medium">Order ID</th>
              <th className="px-6 py-3 font-medium">Customer</th>
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                  {order.id}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">
                    {order.customerName}
                  </div>
                  <div className="text-xs text-slate-400">
                    {order.customerEmail}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{order.product}</td>
                <td className="px-6 py-4 text-slate-500 text-xs">
                  {order.date}
                </td>
                <td className="px-6 py-4 font-medium text-slate-800">
                  ${order.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(order)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete order ${order.id}?`)) {
                          onDelete(order.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
