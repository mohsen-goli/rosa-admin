import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Order } from "../../types/order";
import { StatusBadge } from "../../components/StatusBadge";

interface OrdersTableProps {
  orders: Order[];
  onDelete: (id: string) => void;
  onEdit: (order: Order) => void;
}

export function OrdersTable({ orders, onDelete, onEdit }: OrdersTableProps) {
  const { t } = useTranslation();

  if (orders.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center transition-colors">
        <p className="text-slate-400 text-sm">{t("orders.noOrders")}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-start">
            <tr>
              <th className="px-6 py-3 font-medium text-start">
                {t("orders.table.orderId")}
              </th>
              <th className="px-6 py-3 font-medium text-start">
                {t("orders.table.customer")}
              </th>
              <th className="px-6 py-3 font-medium text-start">
                {t("orders.table.product")}
              </th>
              <th className="px-6 py-3 font-medium text-start">
                {t("orders.table.date")}
              </th>
              <th className="px-6 py-3 font-medium text-start">
                {t("orders.table.amount")}
              </th>
              <th className="px-6 py-3 font-medium text-start">
                {t("orders.table.status")}
              </th>
              <th className="px-6 py-3 font-medium text-end">
                {t("orders.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                  {order.id}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800 dark:text-slate-100">
                    {order.customerName}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    {order.customerEmail}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                  {order.product}
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                  {order.date}
                </td>
                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">
                  ${order.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 text-end">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(order)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(t("orders.deleteConfirm", { id: order.id }))
                        ) {
                          onDelete(order.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
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
