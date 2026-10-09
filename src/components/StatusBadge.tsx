import type { OrderStatus } from "../types/order";

interface StatusBadgeProps {
  status: OrderStatus;
}

const statusStyles: Record<OrderStatus, string> = {
  delivered: "bg-green-100 text-green-700",
  shipped: "bg-purple-100 text-purple-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-slate-100 text-slate-600",
};

const statusLabels: Record<OrderStatus, string> = {
  delivered: "Delivered",
  shipped: "Shipped",
  pending: "Pending",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
