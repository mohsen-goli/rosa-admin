import { useTranslation } from "react-i18next";
import type { OrderStatus } from "../types/order";

interface StatusBadgeProps {
  status: OrderStatus;
}

const statusStyles: Record<OrderStatus, string> = {
  delivered:
    "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  shipped:
    "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  cancelled:
    "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusStyles[status]}`}
    >
      {t(`orders.status.${status}`)}
    </span>
  );
}
