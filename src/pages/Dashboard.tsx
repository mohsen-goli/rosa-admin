import { lazy, Suspense, useMemo } from "react";
import { ShoppingCart, DollarSign, Users, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatCard } from "../components/StatCard";
import { useDatabaseOrders } from "../hooks/useDatabaseOrders";
import { StatusDonut } from "../features/charts/StatusDonut";
import { RevenueArea } from "../features/charts/RevenueArea";
import { MonthlyBars } from "../features/charts/MonthlyBars";

const HeroScene = lazy(() => import("../features/three/HeroScene").then((module) => ({ default: module.HeroScene })));
const formatMoney = (value: number, currency: "IRR" | "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: currency === "USD" ? 2 : 0 })
    .format(value / (currency === "USD" ? 100 : 1));

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
    <Suspense fallback={<div className="h-64 lg:h-80 rounded-xl bg-slate-900 animate-pulse" />}><HeroScene /></Suspense>
    <div><h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("dashboard.title")}</h1><p className="text-slate-500 dark:text-slate-400 mt-1">{t("dashboard.subtitle")}</p></div>
    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title={t("dashboard.stats.totalOrders")} value={loading ? "…" : String(stats.totalOrders)} icon={ShoppingCart} />
      <StatCard title={t("dashboard.stats.revenue")} value={loading ? "…" : [stats.revenueIRR ? formatMoney(stats.revenueIRR, "IRR") : "", stats.revenueUSD ? formatMoney(stats.revenueUSD, "USD") : ""].filter(Boolean).join(" · ") || "—"} icon={DollarSign} />
      <StatCard title={t("dashboard.stats.uniqueCustomers")} value={loading ? "…" : String(stats.uniqueCustomers)} icon={Users} />
      <StatCard title={t("dashboard.stats.productsSold")} value={loading ? "…" : String(stats.totalProducts)} icon={Package} />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><StatusDonut orders={orders} /><RevenueArea orders={orders} /></div>
    <div className="grid grid-cols-1"><MonthlyBars orders={orders} /></div>
  </div>;
}