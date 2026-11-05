import { useTranslation } from "react-i18next";
import type {
  DatabaseOrder,
  DatabaseOrderStatus,
} from "../../types/databaseOrder";
import { StatusBadge } from "../../components/StatusBadge";

interface OrdersTableProps {
  orders: DatabaseOrder[];
  onStatusChange: (id: string, status: DatabaseOrderStatus) => void;
  updatingOrderId: string | null;
}

const statusOptions: DatabaseOrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function OrdersTable({
  orders,
  onStatusChange,
  updatingOrderId,
}: OrdersTableProps) {
  const { t } = useTranslation();

  if (orders.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
        <p className="text-slate-400 text-sm">{t("orders.noOrders")}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1050px]">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-start font-medium">
                Order ID
              </th>
              <th className="px-4 sm:px-6 py-3 text-start font-medium">
                Customer
              </th>
              <th className="px-4 sm:px-6 py-3 text-start font-medium">
                Products
              </th>
              <th className="px-4 sm:px-6 py-3 text-start font-medium">Date</th>
              <th className="px-4 sm:px-6 py-3 text-start font-medium">
                Total
              </th>
              <th className="px-4 sm:px-6 py-3 text-start font-medium">
                Payment
              </th>
              <th className="px-4 sm:px-6 py-3 text-start font-medium">
                Order Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-4 sm:px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                  #{order.orderNumber}
                </td>

                <td className="px-4 sm:px-6 py-4">
                  <div className="font-medium text-slate-800 dark:text-slate-100">
                    {order.customerName}
                  </div>
                  <div className="text-xs text-slate-400">
                    {order.customerEmail || "No email"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {order.customerPhone || "No phone"}
                  </div>
                </td>

                <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-300">
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id}>
                        {item.productName} × {item.quantity}
                      </div>
                    ))}
                  </div>
                </td>

                <td className="px-4 sm:px-6 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>

                <td className="px-4 sm:px-6 py-4 font-medium text-slate-800 dark:text-slate-100 whitespace-nowrap">
                  ${order.total.toLocaleString()}
                </td>

                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {order.paymentStatus}
                  </span>
                </td>

                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <StatusBadge status={order.status} />

                    <select
                      value={order.status}
                      disabled={updatingOrderId === order.id}
                      onChange={(event) =>
                        onStatusChange(
                          order.id,
                          event.target.value as DatabaseOrderStatus,
                        )
                      }
                      className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 disabled:opacity-50"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    {updatingOrderId === order.id && (
                      <span className="text-xs text-slate-400">Saving...</span>
                    )}
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
