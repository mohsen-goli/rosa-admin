import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import type { DatabaseOrder } from "../../types/databaseOrder";

interface Props { orders: DatabaseOrder[]; }
export function MonthlyBars({ orders }: Props) {
  const { t } = useTranslation();
  const now = new Date();
  const data = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return { month: date.toLocaleDateString(undefined, { month: "short" }), orders: orders.filter((order) => order.createdAt.slice(0, 7) === key).length };
  });
  return <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 transition-colors">
    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">{t("dashboard.charts.monthlyOrders")}</h3>
    <ResponsiveContainer width="100%" height={280}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="month" stroke="#94a3b8" fontSize={12} /><YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} /><Tooltip /><Bar dataKey="orders" fill="#ec4899" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
  </div>;
}