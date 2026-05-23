"use client";

"use client";

import { useState } from "react";
import { Bell, Search, Sun, Moon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/providers";
import { useUIStore, useWorkspaceStore } from "@/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const { isMobile, sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { currentWorkspace } = useWorkspaceStore();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        {currentWorkspace && (
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: currentWorkspace.color || "#0ea5e9" }}
            >
              {currentWorkspace.name[0]}
            </div>
            <span className="font-medium hidden sm:inline">{currentWorkspace.name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className={cn("relative", searchOpen ? "block" : "hidden md:block")}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-48 pl-9 lg:w-64 h-9"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:hidden"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <Search className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              {resolvedTheme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}