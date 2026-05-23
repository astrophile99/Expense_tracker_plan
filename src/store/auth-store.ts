import { create } from "zustand"
import type { User, Profile } from "@/types"

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setAuth: (user: User | null, profile: Profile | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setAuth: (user, profile) =>
    set({ user, profile, isAuthenticated: !!user, isLoading: false }),
  logout: () =>
    set({ user: null, profile: null, isAuthenticated: false, isLoading: false }),
}))
