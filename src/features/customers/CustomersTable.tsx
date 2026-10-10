import { Crown, Star, UserPlus } from "lucide-react";
import type { Customer } from "../../lib/customers";

interface CustomersTableProps {
  customers: Customer[];
}

const statusConfig = {
  vip: {
    label: "VIP",
    icon: Crown,
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  },
  regular: {
    label: "Regular",
    icon: Star,
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  },
  new: {
    label: "New",
    icon: UserPlus,
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  },
};

export function CustomersTable({ customers }: CustomersTableProps) {
  if (customers.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
        <p className="text-slate-400 text-sm">No customers found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-left">
            <tr>
              <th className="px-6 py-3 font-medium">Customer</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Orders</th>
              <th className="px-6 py-3 font-medium">Total Spent</th>
              <th className="px-6 py-3 font-medium">Last Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {customers.map((customer) => {
              const status = statusConfig[customer.status];
              const StatusIcon = status.icon;

              return (
                <tr
                  key={customer.email}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center text-pink-600 dark:text-pink-400 font-bold">
                        {customer.name[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-100">
                          {customer.name}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                          {customer.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}
                    >
                      <StatusIcon size={12} />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                    {customer.totalOrders}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">
                    ${customer.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                    {customer.lastOrderDate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
