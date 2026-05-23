import { create } from "zustand"
import type { Workspace, WorkspaceMember } from "@/types"

interface WorkspaceState {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  members: WorkspaceMember[]
  isLoading: boolean
  error: string | null
  setWorkspaces: (workspaces: Workspace[]) => void
  setCurrentWorkspace: (workspace: Workspace | null) => void
  setMembers: (members: WorkspaceMember[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addWorkspace: (workspace: Workspace) => void
  updateWorkspace: (id: string, data: Partial<Workspace>) => void
  removeWorkspace: (id: string) => void
  addMember: (member: WorkspaceMember) => void
  removeMember: (userId: string) => void
  updateMemberRole: (userId: string, role: string) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  currentWorkspace: null,
  members: [],
  isLoading: false,
  error: null,
  setWorkspaces: (workspaces) => set({ workspaces }),
  setCurrentWorkspace: (currentWorkspace) => set({ currentWorkspace }),
  setMembers: (members) => set({ members }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  addWorkspace: (workspace) =>
    set((state) => ({ workspaces: [...state.workspaces, workspace] })),
  updateWorkspace: (id, data) =>
    set((state) => ({
      workspaces: state.workspaces.map((w) => (w.id === id ? { ...w, ...data } : w)),
      currentWorkspace: state.currentWorkspace?.id === id ? { ...state.currentWorkspace, ...data } : state.currentWorkspace,
    })),
  removeWorkspace: (id) =>
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w.id !== id),
      currentWorkspace: state.currentWorkspace?.id === id ? null : state.currentWorkspace,
    })),
  addMember: (member) =>
    set((state) => ({ members: [...state.members, member] })),
  removeMember: (userId) =>
    set((state) => ({
      members: state.members.filter((m) => m.userId !== userId),
    })),
  updateMemberRole: (userId, role) =>
    set((state) => ({
      members: state.members.map((m) => (m.userId === userId ? { ...m, role: role as WorkspaceMember["role"] } : m)),
    })),
}))