"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ToastContainer } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed, isMobile, setIsMobile, sidebarOpen } = useUIStore();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [setIsMobile]);

  const paddingLeft = isMobile
    ? "pl-0"
    : sidebarCollapsed
      ? "pl-20"
      : "pl-[280px]";

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div
        className={cn(
          "min-h-screen transition-all duration-200",
          paddingLeft,
          isMobile && sidebarOpen && "overflow-hidden h-screen"
        )}
      >
        <Header />
        <main className="p-4 md:p-6">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}
