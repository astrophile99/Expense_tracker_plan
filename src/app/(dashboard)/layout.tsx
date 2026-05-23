"use client";

import { useUIStore } from "@/store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div
        className={cn(
          "min-h-screen transition-all duration-200",
          sidebarCollapsed ? "pl-20" : "pl-[280px]"
        )}
      >
        <Header />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}