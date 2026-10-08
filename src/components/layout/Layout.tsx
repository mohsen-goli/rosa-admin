import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
