"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store";
import { createClient } from "@/supabase/client";
import { mapSupabaseUser, fetchProfile } from "@/lib/auth";

interface AuthContextType {
  user: ReturnType<typeof useAuthStore.getState>["user"];
  profile: ReturnType<typeof useAuthStore.getState>["profile"];
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, profile, isLoading, isAuthenticated, setAuth, logout } =
    useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const mappedUser = mapSupabaseUser(session.user);
        const profile = await fetchProfile(session.user.id);
        setAuth(mappedUser, profile);
      } else {
        logout();
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const mappedUser = mapSupabaseUser(session.user);
        const profile = await fetchProfile(session.user.id);
        setAuth(mappedUser, profile);
      } else {
        logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setAuth, logout]);

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
