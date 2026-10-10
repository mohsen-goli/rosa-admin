import { Crown, Star, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Customer } from "../../lib/customers";

interface CustomersTableProps {
  customers: Customer[];
}

const statusStyles = {
  vip: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  regular: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  new: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

const statusIcons = {
  vip: Crown,
  regular: Star,
  new: UserPlus,
};

export function CustomersTable({ customers }: CustomersTableProps) {
  const { t } = useTranslation();

  if (customers.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
        <p className="text-slate-400 text-sm">{t("customers.noCustomers")}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 sm:px-6 py-3 font-medium text-start whitespace-nowrap">
                {t("customers.table.customer")}
              </th>
              <th className="px-4 sm:px-6 py-3 font-medium text-start whitespace-nowrap">
                {t("customers.table.status")}
              </th>
              <th className="px-4 sm:px-6 py-3 font-medium text-start whitespace-nowrap">
                {t("customers.table.orders")}
              </th>
              <th className="px-4 sm:px-6 py-3 font-medium text-start whitespace-nowrap">
                {t("customers.table.totalSpent")}
              </th>
              <th className="px-4 sm:px-6 py-3 font-medium text-start whitespace-nowrap">
                {t("customers.table.lastOrder")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {customers.map((customer) => {
              const StatusIcon = statusIcons[customer.status];

              return (
                <tr
                  key={customer.email}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center text-pink-600 dark:text-pink-400 font-bold shrink-0">
                        {customer.name[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 dark:text-slate-100 whitespace-nowrap">
                          {customer.name}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                          {customer.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusStyles[customer.status]}`}
                    >
                      <StatusIcon size={12} />
                      {t(`customers.status.${customer.status}`)}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                    {customer.totalOrders}
                  </td>
                  <td className="px-4 sm:px-6 py-4 font-medium text-slate-800 dark:text-slate-100 whitespace-nowrap">
                    ${customer.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
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
