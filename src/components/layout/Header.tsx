export function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Dashboard</h2>
        <p className="text-xs text-slate-500">Welcome back, Mohsen</p>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-sm text-slate-600 hover:text-slate-900">
          🌙 Theme
        </button>
        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
          M
        </div>
      </div>
    </header>
  );
}
