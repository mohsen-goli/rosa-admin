import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ShoppingCart, label: "Orders", href: "/orders" },
  { icon: Package, label: "Products", href: "/products" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-pink-400">Rosa</h1>
        <p className="text-xs text-slate-400">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        v1.0.0
      </div>
    </aside>
  );
}
