import type { SupabaseClient } from "@supabase/supabase-js"
import { SupabaseRepository, mapRow, type FindAllOptions } from "./supabase-repository"
import type { ActivityLog, PaginatedResponse } from "@/types"
import { mapSupabaseError } from "@/lib/supabase-error"

export class ActivityRepository extends SupabaseRepository<ActivityLog> {
  protected entityName = "ActivityLog"
  protected tableName = "activity_logs"
  protected supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    super()
    this.supabase = supabase
  }

  async findAll(options?: FindAllOptions): Promise<PaginatedResponse<ActivityLog>> {
    const page = options?.pagination?.page ?? 1
    const limit = options?.pagination?.limit ?? 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = this.supabase
      .from(this.tableName)
      .select("*", { count: "exact" })

    if (options?.filters) {
      const { workspaceId, userId, type } = options.filters as Record<string, unknown>
      if (workspaceId) query = query.eq("workspace_id", workspaceId as string)
      if (userId) query = query.eq("user_id", userId as string)
      if (type) query = query.eq("type", type as string)
    }

    query = query.order("created_at", { ascending: false })
    query = query.range(from, to)

    const { data, count, error } = await query
    if (error) throw mapSupabaseError(error)

    const items = (data ?? []).map((row) => {
      const log = mapRow(row as Record<string, unknown>) as ActivityLog
      return log
    })

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

  async findById(id: string): Promise<ActivityLog | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw mapSupabaseError(error)
    }

    return mapRow<ActivityLog>(data as Record<string, unknown>)
  }

  async create(data: Partial<ActivityLog>): Promise<ActivityLog> {
    const dbData: Record<string, unknown> = {
      user_id: data.userId,
      workspace_id: data.workspaceId ?? null,
      type: data.type,
      metadata: data.metadata ?? {},
    }

    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .insert(dbData)
      .select()
      .single()

    if (error) throw mapSupabaseError(error)

    return mapRow<ActivityLog>(result as Record<string, unknown>)
  }

  async update(_id: string, _data: Partial<ActivityLog>): Promise<ActivityLog> {
    throw new Error("Activity logs cannot be updated")
  }

  async delete(_id: string): Promise<void> {
    throw new Error("Activity logs cannot be deleted")
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

  async getByWorkspace(workspaceId: string, limit = 20): Promise<ActivityLog[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw mapSupabaseError(error)

    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>) as ActivityLog)
  }

  async getByUser(userId: string, limit = 20): Promise<ActivityLog[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw mapSupabaseError(error)

    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>) as ActivityLog)
  }
}
