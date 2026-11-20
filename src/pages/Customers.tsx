import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDatabaseOrders } from "../hooks/useDatabaseOrders";
import { extractCustomers } from "../lib/customers";
import { CustomersTable } from "../features/customers/CustomersTable";

export function Customers() {
  const { t } = useTranslation();
  const { orders, loading, error } = useDatabaseOrders();
  const [search, setSearch] = useState("");
  const allCustomers = useMemo(() => extractCustomers(orders), [orders]);
  const filteredCustomers = useMemo(() => allCustomers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.email.toLowerCase().includes(search.toLowerCase())
  ), [allCustomers, search]);
  const vipCount = allCustomers.filter((customer) => customer.status === "vip").length;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("customers.title")}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t("customers.count", { filtered: filteredCustomers.length, total: allCustomers.length })}</p></div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800"><p className="text-xs text-slate-500 dark:text-slate-400">{t("customers.summary.totalCustomers")}</p><p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{allCustomers.length}</p></div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800"><p className="text-xs text-slate-500 dark:text-slate-400">{t("customers.summary.vipCustomers")}</p><p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{vipCount}</p></div>
      </div>
      <div className="relative"><Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("customers.searchPlaceholder")} className="w-full ps-10 pe-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500" /></div>
      {loading ? <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center text-sm text-slate-500">Loading customers...</div> : <CustomersTable customers={filteredCustomers} />}
    </div>
  );
}