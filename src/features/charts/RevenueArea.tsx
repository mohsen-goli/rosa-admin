import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import type { DatabaseOrder } from "../../types/databaseOrder";

interface RevenueAreaProps {
  orders: DatabaseOrder[];
}

export function RevenueArea({ orders }: RevenueAreaProps) {
  const { t } = useTranslation();
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      month: date.toLocaleDateString(undefined, { month: "short" }),
      revenue: 0,
    };
  });

  const monthMap = new Map<string, (typeof months)[number]>(
    months.map((month) => [month.key, month] as const),
  );
  orders.forEach((order) => {
    if (order.status === "cancelled" || order.paymentStatus !== "paid") return;
    const date = new Date(order.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const month = monthMap.get(key);
    if (month) month.revenue += order.total;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 transition-colors">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
        {t("dashboard.charts.revenueTrend")}
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={months}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#ec4899"
            strokeWidth={2}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
