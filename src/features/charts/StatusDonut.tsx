import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useOrdersStore } from "../orders/ordersStore";
import type { OrderStatus } from "../../types/order";

const STATUS_COLORS: Record<OrderStatus, string> = {
  delivered: "#ec4899",
  shipped: "#a855f7",
  pending: "#f59e0b",
  cancelled: "#94a3b8",
};

export function StatusDonut() {
  const { t } = useTranslation();
  const orders = useOrdersStore((state) => state.orders);

  const counts = orders.reduce<Record<OrderStatus, number>>(
    (acc, order) => {
      acc[order.status] = (acc[order.status] ?? 0) + 1;
      return acc;
    },
    { pending: 0, shipped: 0, delivered: 0, cancelled: 0 },
  );

  const data = (Object.keys(counts) as OrderStatus[]).map((status) => ({
    name: t(`orders.status.${status}`),
    value: counts[status],
    color: STATUS_COLORS[status],
  }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 transition-colors">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
        {t("dashboard.charts.ordersByStatus")}
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
