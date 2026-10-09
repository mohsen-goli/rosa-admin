import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { mockOrders } from "../../data/orders";
import type { OrderStatus } from "../../types/order";

const STATUS_COLORS: Record<OrderStatus, string> = {
  delivered: "#ec4899",
  shipped: "#a855f7",
  pending: "#f59e0b",
  cancelled: "#94a3b8",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  delivered: "Delivered",
  shipped: "Shipped",
  pending: "Pending",
  cancelled: "Cancelled",
};

export function StatusDonut() {
  const counts = mockOrders.reduce<Record<OrderStatus, number>>(
    (acc, order) => {
      acc[order.status] = (acc[order.status] ?? 0) + 1;
      return acc;
    },
    { pending: 0, shipped: 0, delivered: 0, cancelled: 0 },
  );

  const data = (Object.keys(counts) as OrderStatus[]).map((status) => ({
    name: STATUS_LABELS[status],
    value: counts[status],
    color: STATUS_COLORS[status],
  }));

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        Orders by Status
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
