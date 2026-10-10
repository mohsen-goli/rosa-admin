import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Settings,
} from "lucide-react";
import { useLanguageStore } from "../../features/language/languageStore";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { icon: LayoutDashboard, labelKey: "nav.dashboard", href: "/" },
  { icon: ShoppingCart, labelKey: "nav.orders", href: "/orders" },
  { icon: Package, labelKey: "nav.products", href: "/products" },
  { icon: Users, labelKey: "nav.customers", href: "/customers" },
  { icon: Settings, labelKey: "nav.settings", href: "/settings" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const isRTL = language === "fa";

  // موقعیت Sidebar وقتی بسته‌ست (خارج از صفحه)
  const closedTransform = isRTL
    ? "translateX(100%)" // فارسی: برو راست
    : "translateX(-100%)"; // انگلیسی: برو چپ

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          transform: isOpen ? "translateX(0)" : closedTransform,
          [isRTL ? "right" : "left"]: isOpen ? 0 : undefined,
        }}
        className={`w-64 bg-slate-900 dark:bg-slate-950 text-white h-screen flex flex-col transition-transform duration-300 z-50
          fixed lg:static top-0
          lg:!transform-none lg:!left-0 lg:!right-auto
        `}
      >
        <div className="p-6 border-b border-slate-800 dark:border-slate-900 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-pink-400">Rosa</h1>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/"}
                onClick={onClose}
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
    </>
  );
}
