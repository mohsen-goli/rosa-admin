import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useTranslation } from "react-i18next";
import type { DatabaseOrder, DatabaseOrderStatus } from "../../types/databaseOrder";

interface Props { orders: DatabaseOrder[]; }
const statuses: DatabaseOrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];
const colors: Record<DatabaseOrderStatus, string> = {
  pending: "#f59e0b", processing: "#3b82f6", shipped: "#a855f7", delivered: "#ec4899", cancelled: "#94a3b8",
};

export function StatusDonut({ orders }: Props) {
  const { t } = useTranslation();
  const data = statuses.map((status) => ({
    name: t(\`orders.status.\${status}\`), value: orders.filter((order) => order.status === status).length, color: colors[status],
  }));
  return <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 transition-colors">
    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">{t("dashboard.charts.ordersByStatus")}</h3>
    {orders.length === 0 ? <p className="h-[280px] flex items-center justify-center text-sm text-slate-400">No order data yet</p> :
      <ResponsiveContainer width="100%" height={280}><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>{data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>}
  </div>;
}