"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuthStore } from "@/store";

interface AuthContextType {
  user: ReturnType<typeof useAuthStore.getState>["user"];
  profile: ReturnType<typeof useAuthStore.getState>["profile"];
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, profile, isLoading, isAuthenticated } = useAuthStore();

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}