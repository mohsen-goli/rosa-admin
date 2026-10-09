import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Apr", revenue: 4200 },
  { month: "May", revenue: 5800 },
  { month: "Jun", revenue: 4900 },
  { month: "Jul", revenue: 7200 },
  { month: "Aug", revenue: 6800 },
  { month: "Sep", revenue: 9100 },
];

export function RevenueArea() {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        Revenue Trend
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
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
