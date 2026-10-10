import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, labelKey: "nav.dashboard", href: "/" },
  { icon: ShoppingCart, labelKey: "nav.orders", href: "/orders" },
  { icon: Package, labelKey: "nav.products", href: "/products" },
  { icon: Users, labelKey: "nav.customers", href: "/customers" },
  { icon: Settings, labelKey: "nav.settings", href: "/settings" },
];

export function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="w-64 bg-slate-900 dark:bg-slate-950 text-white h-screen flex flex-col transition-colors">
      <div className="p-6 border-b border-slate-800 dark:border-slate-900">
        <h1 className="text-2xl font-bold text-pink-400">Rosa</h1>
        <p className="text-xs text-slate-400">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-pink-500 text-white"
                    : "text-slate-300 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white"
                }`
              }
            >
              <Icon size={20} />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 dark:border-slate-900 text-xs text-slate-500">
        v1.0.0
      </div>
    </aside>
  );
}
