import { ShoppingCart, DollarSign, Users, Package } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { calculateStats } from "../lib/stats";
import { useOrdersStore } from "../features/orders/ordersStore";
import { HeroScene } from "../features/three/HeroScene";
import { StatusDonut } from "../features/charts/StatusDonut";
import { RevenueArea } from "../features/charts/RevenueArea";
import { MonthlyBars } from "../features/charts/MonthlyBars";

export function Dashboard() {
  const orders = useOrdersStore((state) => state.orders);
  const stats = calculateStats(orders);

  return (
    <div className="space-y-6">
      <HeroScene />

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Dashboard Overview
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Here's what's happening with Rosa today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toString()}
          icon={ShoppingCart}
          trend="+12% this month"
          trendUp
        />
        <StatCard
          title="Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend="+8% this month"
          trendUp
        />
        <StatCard
          title="Unique Customers"
          value={stats.uniqueCustomers.toString()}
          icon={Users}
          trend="+3 new"
          trendUp
        />
        <StatCard
          title="Products Sold"
          value={stats.totalProducts.toString()}
          icon={Package}
          trend="-2% this month"
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
