import { lazy, Suspense } from "react";
import { ShoppingCart, DollarSign, Users, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatCard } from "../components/StatCard";
import { calculateStats } from "../lib/stats";
import { StatusDonut } from "../features/charts/StatusDonut";
import { RevenueArea } from "../features/charts/RevenueArea";
import { MonthlyBars } from "../features/charts/MonthlyBars";
import { useAdminOrders } from "../features/orders/useAdminOrders";

const HeroScene = lazy(() =>
  import("../features/three/HeroScene").then((m) => ({
    default: m.HeroScene,
  })),
);

export function Dashboard() {
  const { t } = useTranslation();
  const { orders, loading, error, refresh } = useAdminOrders();
  const stats = calculateStats(orders);

  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="h-64 lg:h-80 rounded-xl bg-slate-900 animate-pulse" />
        }
      >
        <HeroScene />
      </Suspense>

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {t("dashboard.title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {loading && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading live order data...
        </p>
      )}
      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          <span>Could not load dashboard orders: {error}</span>
          <button
            type="button"
            onClick={() => void refresh()}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("dashboard.stats.totalOrders")}
          value={stats.totalOrders.toString()}
          icon={ShoppingCart}
        />
        <StatCard
          title={t("dashboard.stats.revenue")}
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
        />
        <StatCard
          title={t("dashboard.stats.uniqueCustomers")}
          value={stats.uniqueCustomers.toString()}
          icon={Users}
        />
        <StatCard
          title={t("dashboard.stats.productsSold")}
          value={stats.totalProducts.toString()}
          icon={Package}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatusDonut orders={orders} />
        <RevenueArea orders={orders} />
      </div>

      <div className="grid grid-cols-1">
        <MonthlyBars orders={orders} />
      </div>
    </div>
  );
}
