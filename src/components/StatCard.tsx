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
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
            {title}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2 truncate">
            {value}
          </p>
          {trend && (
            <p
              className={`text-xs mt-2 font-medium truncate ${
                trendUp
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {trend}
            </p>
          )}
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center shrink-0">
          <Icon className="text-pink-500 dark:text-pink-400" size={22} />
        </div>
      </div>
    </div>
  );
}
