import { lazy, Suspense } from "react";
import { ShoppingCart, DollarSign, Users, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatCard } from "../components/StatCard";
import { calculateStats } from "../lib/stats";
import { useOrdersStore } from "../features/orders/ordersStore";
import { StatusDonut } from "../features/charts/StatusDonut";
import { RevenueArea } from "../features/charts/RevenueArea";
import { MonthlyBars } from "../features/charts/MonthlyBars";

const HeroScene = lazy(() =>
  import("../features/three/HeroScene").then((m) => ({
    default: m.HeroScene,
  })),
);

export function Dashboard() {
  const { t } = useTranslation();
  const orders = useOrdersStore((state) => state.orders);
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("dashboard.stats.totalOrders")}
          value={stats.totalOrders.toString()}
          icon={ShoppingCart}
          trend={`+12% ${t("dashboard.stats.thisMonth")}`}
          trendUp
        />
        <StatCard
          title={t("dashboard.stats.revenue")}
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={`+8% ${t("dashboard.stats.thisMonth")}`}
          trendUp
        />
        <StatCard
          title={t("dashboard.stats.uniqueCustomers")}
          value={stats.uniqueCustomers.toString()}
          icon={Users}
          trend={t("dashboard.stats.newThisMonth")}
          trendUp
        />
        <StatCard
          title={t("dashboard.stats.productsSold")}
          value={stats.totalProducts.toString()}
          icon={Package}
          trend={`-2% ${t("dashboard.stats.thisMonth")}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatusDonut />
        <RevenueArea />
      </div>

      <div className="grid grid-cols-1">
        <MonthlyBars />
      </div>
    </div>
  );
}
