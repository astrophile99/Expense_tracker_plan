import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "success" | "error" | "warning"
  duration?: number
}

interface UIState {
  theme: "light" | "dark" | "system"
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  toasts: Toast[]
  activeModal: string | null
  isMobile: boolean
  setTheme: (theme: "light" | "dark" | "system") => void
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  setActiveModal: (modal: string | null) => void
  setIsMobile: (isMobile: boolean) => void
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "system",
      sidebarOpen: false,
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      toasts: [],
      activeModal: null,
      isMobile: false,
      setTheme: (theme) => set({ theme }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      setActiveModal: (activeModal) => set({ activeModal }),
      setIsMobile: (isMobile) => set({ isMobile }),
      addToast: (toast) =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            { ...toast, id: crypto.randomUUID() },
          ],
        })),
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
    }),
    {
      name: "finance-ui-store",
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)