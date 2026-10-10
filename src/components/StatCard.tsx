import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">
            {value}
          </p>
          {trend && (
            <p
              className={`text-xs mt-2 font-medium ${
                trendUp
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {trend}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center shrink-0">
          <Icon className="text-pink-500 dark:text-pink-400" size={24} />
        </div>
      </div>
    </div>
  );
}
