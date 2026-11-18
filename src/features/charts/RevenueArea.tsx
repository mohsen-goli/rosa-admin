import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import type { DatabaseOrder } from "../../types/databaseOrder";

interface Props { orders: DatabaseOrder[]; }
export function RevenueArea({ orders }: Props) {
  const { t } = useTranslation();
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const key = \`\${date.getFullYear()}-\${String(date.getMonth() + 1).padStart(2, "0")}\`;
    const revenue = orders.filter((order) => order.currency === "IRR" && order.status !== "cancelled" && order.createdAt.slice(0, 7) === key)
      .reduce((sum, order) => sum + order.total, 0);
    return { month: date.toLocaleDateString(undefined, { month: "short" }), revenue };
  });
  return <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 transition-colors">
    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">{t("dashboard.charts.revenueTrend")}</h3>
    <p className="text-xs text-slate-400 mb-4">IRR orders only · USD shown separately in summary</p>
    <ResponsiveContainer width="100%" height={260}><AreaChart data={months}><defs><linearGradient id="rosaRevenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} /><stop offset="95%" stopColor="#ec4899" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="month" stroke="#94a3b8" fontSize={12} /><YAxis stroke="#94a3b8" fontSize={12} /><Tooltip formatter={(value) => [new Intl.NumberFormat("en-US").format(Number(value)) + " IRR", "Revenue"]} /><Area type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={2} fill="url(#rosaRevenueFill)" /></AreaChart></ResponsiveContainer>
  </div>;
}