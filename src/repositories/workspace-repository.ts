import type { SupabaseClient } from "@supabase/supabase-js"
import { SupabaseRepository, mapRow, mapToDb, type FindAllOptions } from "./supabase-repository"
import type { Workspace, WorkspaceMember, WorkspaceInvitation, PaginatedResponse } from "@/types"
import { WorkspaceRole } from "@/types"
import { NotFoundError, BusinessRuleError, ConflictError } from "@/config/errors"
import { mapSupabaseError } from "@/lib/supabase-error"

export class WorkspaceRepository extends SupabaseRepository<Workspace> {
  protected entityName = "Workspace"
  protected tableName = "workspaces"
  protected supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    super()
    this.supabase = supabase
  }

  async findAll(options?: FindAllOptions): Promise<PaginatedResponse<Workspace>> {
    const page = options?.pagination?.page ?? 1
    const limit = options?.pagination?.limit ?? 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = this.supabase
      .from(this.tableName)
      .select("*", { count: "exact" })

    if (options?.pagination?.sortBy) {
      query = query.order(options.pagination.sortBy, {
        ascending: options.pagination.sortOrder === "asc",
      })
    } else {
      query = query.order("created_at", { ascending: false })
    }

    query = query.range(from, to)

    const { data, count, error } = await query
    if (error) throw mapSupabaseError(error)

    const items = (data ?? []).map((row) => mapRow(row as Record<string, unknown>) as Workspace)

    return {
      data: items,
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
      hasNextPage: page * limit < (count ?? 0),
      hasPrevPage: page > 1,
    }
  }

  async findById(id: string): Promise<Workspace | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw mapSupabaseError(error)
    }

    return mapRow<Workspace>(data as Record<string, unknown>)
  }

  async create(data: Partial<Workspace>): Promise<Workspace> {
    const dbData = mapToDb(data as Record<string, unknown>) as Record<string, unknown>
    dbData.created_at = new Date().toISOString()
    dbData.updated_at = new Date().toISOString()

    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .insert(dbData)
      .select()
      .single()

    if (error) throw mapSupabaseError(error)

    const workspace = mapRow<Workspace>(result as Record<string, unknown>)

    await this.supabase.from("workspace_members").insert({
      workspace_id: workspace.id,
      user_id: workspace.createdBy,
      role: "owner",
      joined_at: new Date().toISOString(),
    })

    return workspace
  }

  async update(id: string, data: Partial<Workspace>): Promise<Workspace> {
    const dbData = mapToDb(data as Record<string, unknown>) as Record<string, unknown>
    dbData.updated_at = new Date().toISOString()

    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update(dbData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") throw new NotFoundError(this.entityName, id)
      throw mapSupabaseError(error)
    }

    return mapRow<Workspace>(result as Record<string, unknown>)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq("id", id)

    if (error) throw mapSupabaseError(error)
  }

  async count(filters?: Record<string, unknown>): Promise<number> {
    let query = this.supabase
      .from(this.tableName)
      .select("*", { count: "exact", head: true })

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value)
      }
    }

    const { count, error } = await query
    if (error) throw mapSupabaseError(error)
    return count ?? 0
  }

  // ──────────────────────
  // MEMBERS
  // ──────────────────────

  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const { data, error } = await this.supabase
      .from("workspace_members")
      .select(`
        *,
        user:user_id(id, email)
      `)
      .eq("workspace_id", workspaceId)

    if (error) throw mapSupabaseError(error)

    return (data ?? []).map((row) => {
      const member = mapRow(row as Record<string, unknown>) as WorkspaceMember
      const userRaw = row.user as unknown
      const userData = (Array.isArray(userRaw) ? (userRaw as Record<string, unknown>[])[0] : userRaw) as Record<string, unknown> | undefined
      if (userData) {
        member.user = {
          id: userData.id as string,
          email: userData.email as string,
          createdAt: "",
          updatedAt: "",
        }
      }
      return member
    })
  }

  async getMember(workspaceId: string, userId: string): Promise<WorkspaceMember | null> {
    const { data, error } = await this.supabase
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .maybeSingle()

    if (error) throw mapSupabaseError(error)
    if (!data) return null

    return mapRow<WorkspaceMember>(data as Record<string, unknown>)
  }

  async addMember(workspaceId: string, userId: string, role: WorkspaceRole = WorkspaceRole.MEMBER, invitedBy?: string): Promise<WorkspaceMember> {
    const existing = await this.getMember(workspaceId, userId)
    if (existing) throw new ConflictError("User is already a member of this workspace")

    const { data, error } = await this.supabase
      .from("workspace_members")
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        role,
        invited_by: invitedBy,
        joined_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw mapSupabaseError(error)

    return mapRow<WorkspaceMember>(data as Record<string, unknown>)
  }

  async updateMemberRole(workspaceId: string, userId: string, role: WorkspaceRole): Promise<WorkspaceMember> {
    const member = await this.getMember(workspaceId, userId)
    if (!member) throw new NotFoundError("WorkspaceMember")
    if (member.role === WorkspaceRole.OWNER && role !== WorkspaceRole.OWNER) {
      throw new BusinessRuleError("Cannot change the owner's role")
    }

    const { data, error } = await this.supabase
      .from("workspace_members")
      .update({ role })
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw mapSupabaseError(error)

    return mapRow<WorkspaceMember>(data as Record<string, unknown>)
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    const member = await this.getMember(workspaceId, userId)
    if (!member) throw new NotFoundError("WorkspaceMember")
    if (member.role === WorkspaceRole.OWNER) {
      throw new BusinessRuleError("Cannot remove the workspace owner")
    }

    const { error } = await this.supabase
      .from("workspace_members")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)

    if (error) throw mapSupabaseError(error)
  }

  async getMemberCount(workspaceId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from("workspace_members")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)

    if (error) throw mapSupabaseError(error)
    return count ?? 0
  }

  // ──────────────────────
  // INVITATIONS
  // ──────────────────────

  async getInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
    const { data, error } = await this.supabase
      .from("workspace_invitations")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })

    if (error) throw mapSupabaseError(error)

    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>) as WorkspaceInvitation)
  }

  async createInvitation(invitation: Partial<WorkspaceInvitation>): Promise<WorkspaceInvitation> {
    const dbData: Record<string, unknown> = {
      workspace_id: invitation.workspaceId,
      email: invitation.email,
      role: invitation.role ?? WorkspaceRole.MEMBER,
      invited_by: invitation.invitedBy,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }

    const { data, error } = await this.supabase
      .from("workspace_invitations")
      .insert(dbData)
      .select()
      .single()

    if (error) throw mapSupabaseError(error)

    return mapRow<WorkspaceInvitation>(data as Record<string, unknown>)
  }

  // ──────────────────────
  // USER WORKSPACES
  // ──────────────────────

  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    const { data, error } = await this.supabase
      .from("workspace_members")
      .select(`
        workspace_id,
        workspaces!inner(*)
      `)
      .eq("user_id", userId)

    if (error) throw mapSupabaseError(error)

    const workspaces = (data ?? [])
      .filter((row) => row.workspaces)
      .map((row) => {
        const wsData = (Array.isArray(row.workspaces)
          ? (row.workspaces as unknown as Record<string, unknown>[])[0]
          : row.workspaces) as Record<string, unknown>
        return { ...mapRow(wsData), memberCount: undefined } as Workspace
      })

    const workspaceIds = workspaces.map((w) => w.id)
    if (workspaceIds.length === 0) return workspaces

    const { data: counts } = await this.supabase
      .from("workspace_members")
      .select("workspace_id", { count: "exact", head: false })

    if (counts) {
      const countMap: Record<string, number> = {}
      for (const row of counts) {
        const wid = row.workspace_id as string
        countMap[wid] = (countMap[wid] ?? 0) + 1
      }
      for (const ws of workspaces) {
        ws.memberCount = countMap[ws.id] ?? 0
      }
    }

    return workspaces
  }

  async getUserRole(workspaceId: string, userId: string): Promise<WorkspaceRole | null> {
    const member = await this.getMember(workspaceId, userId)
    return member?.role ?? null
  }
}
