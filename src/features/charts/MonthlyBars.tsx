import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import type { DatabaseOrder } from "../../types/databaseOrder";

interface MonthlyBarsProps {
  orders: DatabaseOrder[];
}

export function MonthlyBars({ orders }: MonthlyBarsProps) {
  const { t } = useTranslation();
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      month: date.toLocaleDateString(undefined, { month: "short" }),
      orders: 0,
    };
  });

  const monthMap = new Map(months.map((month) => [month.key, month]));
  orders.forEach((order) => {
    if (order.status === "cancelled") return;
    const date = new Date(order.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const month = monthMap.get(key);
    if (month) month.orders += 1;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 transition-colors">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
        {t("dashboard.charts.monthlyOrders")}
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={months}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip />
          <Bar dataKey="orders" fill="#ec4899" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
