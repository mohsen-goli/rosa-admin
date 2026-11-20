import { lazy, Suspense, useMemo } from "react";
import { ShoppingCart, DollarSign, Users, Package, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatCard } from "../components/StatCard";
import { useDatabaseOrders } from "../hooks/useDatabaseOrders";

const StatusDonut = lazy(() => import("../features/charts/StatusDonut").then((module) => ({ default: module.StatusDonut })));
const RevenueArea = lazy(() => import("../features/charts/RevenueArea").then((module) => ({ default: module.RevenueArea })));
const MonthlyBars = lazy(() => import("../features/charts/MonthlyBars").then((module) => ({ default: module.MonthlyBars })));

const formatMoney = (value: number, currency: "IRR" | "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: currency === "USD" ? 2 : 0 })
    .format(value / (currency === "USD" ? 100 : 1));

function ChartLoadingPlaceholder() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Loading dashboard charts">
      <div className="h-[340px] animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
      <div className="h-[340px] animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
      <div className="h-[340px] animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:col-span-2" />
    </div>
  );
}

export function Dashboard() {
  const { t } = useTranslation();
  const { orders, loading, error } = useDatabaseOrders();
  const stats = useMemo(() => {
    const completedRevenue = orders.filter((order) => order.status !== "cancelled");
    const customers = new Set(orders.map((order) => order.customerEmail?.trim().toLowerCase() || order.userId || order.id));
    return {
      totalOrders: orders.length,
      revenueIRR: completedRevenue.filter((order) => order.currency === "IRR").reduce((sum, order) => sum + order.total, 0),
      revenueUSD: completedRevenue.filter((order) => order.currency === "USD").reduce((sum, order) => sum + order.total, 0),
      uniqueCustomers: customers.size,
      totalProducts: orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
    };
  }, [orders]);

  return <div className="space-y-6">
    <section className="relative isolate overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-fuchsia-50 px-6 py-7 shadow-sm dark:border-rose-900/40 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/40 sm:px-8 sm:py-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-rose-200/50 blur-3xl dark:bg-rose-500/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-1/4 h-48 w-48 rounded-full bg-fuchsia-200/40 blur-3xl dark:bg-fuchsia-500/10" />
      <div className="relative z-10 max-w-2xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-white/70 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-rose-700 dark:border-rose-800 dark:bg-slate-900/70 dark:text-rose-300">
          <Sparkles size={14} aria-hidden="true" />
          ROSA BEAUTY
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-3xl">
          {t("dashboard.title")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
          {t("dashboard.subtitle")}
        </p>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute -right-5 top-1/2 hidden h-44 w-44 -translate-y-1/2 rounded-full border border-rose-200/70 sm:block dark:border-rose-300/10" />
      <div aria-hidden="true" className="pointer-events-none absolute right-8 top-1/2 hidden h-28 w-28 -translate-y-1/2 rounded-full border border-rose-300/60 sm:block dark:border-rose-300/15" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[4.35rem] top-1/2 hidden h-3 w-3 -translate-y-1/2 rounded-full bg-rose-400/70 shadow-[0_0_28px_rgba(244,63,94,0.45)] sm:block" />
    </section>
    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title={t("dashboard.stats.totalOrders")} value={loading ? "…" : String(stats.totalOrders)} icon={ShoppingCart} />
      <StatCard title={t("dashboard.stats.revenue")} value={loading ? "…" : [stats.revenueIRR ? formatMoney(stats.revenueIRR, "IRR") : "", stats.revenueUSD ? formatMoney(stats.revenueUSD, "USD") : ""].filter(Boolean).join(" · ") || "—"} icon={DollarSign} />
      <StatCard title={t("dashboard.stats.uniqueCustomers")} value={loading ? "…" : String(stats.uniqueCustomers)} icon={Users} />
      <StatCard title={t("dashboard.stats.productsSold")} value={loading ? "…" : String(stats.totalProducts)} icon={Package} />
    </div>
    <Suspense fallback={<ChartLoadingPlaceholder />}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatusDonut orders={orders} />
        <RevenueArea orders={orders} />
      </div>
      <div className="grid grid-cols-1">
        <MonthlyBars orders={orders} />
      </div>
    </Suspense>
  </div>;
}
