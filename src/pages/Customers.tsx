import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { extractCustomers } from "../lib/customers";
import { CustomersTable } from "../features/customers/CustomersTable";
import { useAdminOrders } from "../features/orders/useAdminOrders";

export function Customers() {
  const { t } = useTranslation();
  const { orders, loading, error, refresh } = useAdminOrders();
  const [search, setSearch] = useState("");

  const allCustomers = useMemo(() => extractCustomers(orders), [orders]);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();
    return allCustomers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(normalizedSearch) ||
        customer.email.toLowerCase().includes(normalizedSearch),
    );
  }, [allCustomers, search]);

  const totalRevenue = allCustomers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0,
  );
  const vipCount = allCustomers.filter((customer) => customer.status === "vip").length;

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

      {loading && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading live customer data...
        </p>
      )}
      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          <span>Could not load customers: {error}</span>
          <button
            type="button"
            onClick={() => void refresh()}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

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
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("customers.searchPlaceholder")}
          className="w-full ps-10 pe-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      <CustomersTable customers={filteredCustomers} />
    </div>
  );
}
