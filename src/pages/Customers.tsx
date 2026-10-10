import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useOrdersStore } from "../features/orders/ordersStore";
import { extractCustomers } from "../lib/customers";
import { CustomersTable } from "../features/customers/CustomersTable";

export function Customers() {
  const { t } = useTranslation();
  const orders = useOrdersStore((state) => state.orders);
  const [search, setSearch] = useState("");

  const allCustomers = useMemo(() => extractCustomers(orders), [orders]);

  const filteredCustomers = useMemo(() => {
    return allCustomers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase()),
    );
  }, [allCustomers, search]);

  const totalRevenue = allCustomers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0,
  );

  const vipCount = allCustomers.filter((c) => c.status === "vip").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {t("customers.title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {t("customers.count", {
            filtered: filteredCustomers.length,
            total: allCustomers.length,
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 transition-colors">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("customers.summary.totalCustomers")}
          </p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {allCustomers.length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 transition-colors">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("customers.summary.vipCustomers")}
          </p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {vipCount}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 transition-colors">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("customers.summary.totalRevenue")}
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search
          className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("customers.searchPlaceholder")}
          className="w-full ps-10 pe-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      <CustomersTable customers={filteredCustomers} />
    </div>
  );
}
