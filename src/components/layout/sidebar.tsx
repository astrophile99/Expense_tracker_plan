"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore, useAuthStore } from "@/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Budgets", href: "/budgets", icon: PiggyBank },
  { name: "Workspaces", href: "/workspaces", icon: Users },
];

const bottomNav = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    isMobile,
    setIsMobile,
    sidebarOpen,
    setSidebarOpen,
  } = useUIStore();
  const { user, profile } = useAuthStore();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [setIsMobile]);

  const handleLinkClick = useCallback(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile, setSidebarOpen]);

  const sidebarWidth = isMobile ? 280 : sidebarCollapsed ? 80 : 280;

  return (
    <>
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarWidth,
          x: isMobile && !sidebarOpen ? -sidebarWidth : 0,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r bg-background overflow-hidden",
          isMobile && "shadow-2xl"
        )}
      >
        <div className="flex h-full flex-col">
          <div
            className={cn(
              "flex h-16 items-center border-b px-4 shrink-0",
              sidebarCollapsed && !isMobile ? "justify-center" : "justify-between"
            )}
          >
            {(!sidebarCollapsed || isMobile) && (
              <Link
                href="/dashboard"
                onClick={handleLinkClick}
                className="flex items-center gap-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Wallet className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold">Finance</span>
              </Link>
            )}
            {sidebarCollapsed && !isMobile && (
              <Link href="/dashboard" onClick={handleLinkClick}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Wallet className="h-5 w-5 text-primary-foreground" />
                </div>
              </Link>
            )}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    sidebarCollapsed && !isMobile && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <AnimatePresence initial={false}>
                    {(!sidebarCollapsed || isMobile) && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </nav>

          <div className="border-t px-3 py-4 shrink-0">
            {bottomNav.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    sidebarCollapsed && !isMobile && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <AnimatePresence initial={false}>
                    {(!sidebarCollapsed || isMobile) && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </div>

          <div
            className={cn(
              "border-t p-3 shrink-0",
              sidebarCollapsed && !isMobile
                ? "flex flex-col items-center gap-2"
                : "flex items-center gap-3"
            )}
          >
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={profile?.avatarUrl} />
              <AvatarFallback>{profile?.fullName?.[0] || "U"}</AvatarFallback>
            </Avatar>
            {(!sidebarCollapsed || isMobile) && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">
                  {profile?.fullName || "User"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email || "user@email.com"}
                </p>
              </div>
            )}
            {(!sidebarCollapsed || isMobile) && (
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>

          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-4 top-20 h-8 w-8 rounded-full border bg-background shadow-sm z-10"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </motion.aside>
    </>
  );
}
