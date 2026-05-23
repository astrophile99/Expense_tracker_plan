import type { SupabaseClient } from "@supabase/supabase-js"
import { SupabaseRepository, mapRow, type FindAllOptions } from "./supabase-repository"
import type { Budget, PaginatedResponse } from "@/types"
import { mapSupabaseError } from "@/lib/supabase-error"

export class BudgetRepository extends SupabaseRepository<Budget> {
  protected entityName = "Budget"
  protected tableName = "budgets"
  protected supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    super()
    this.supabase = supabase
  }

  async findAll(options?: FindAllOptions): Promise<PaginatedResponse<Budget>> {
    const page = options?.pagination?.page ?? 1
    const limit = options?.pagination?.limit ?? 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = this.supabase
      .from(this.tableName)
      .select("*", { count: "exact" })

    if (options?.filters) {
      const { userId, workspaceId, categoryId, period } = options.filters as Record<string, unknown>
      if (userId) query = query.eq("user_id", userId as string)
      if (workspaceId) query = query.eq("workspace_id", workspaceId as string)
      if (categoryId) query = query.eq("category_id", categoryId as string)
      if (period) query = query.eq("period", period as string)
    }

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

    const items = (data ?? []).map((row) => mapRow(row as Record<string, unknown>) as Budget)

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

  async findById(id: string): Promise<Budget | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw mapSupabaseError(error)
    }

    return mapRow<Budget>(data as Record<string, unknown>)
  }

  async create(data: Partial<Budget>): Promise<Budget> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .insert(data as Record<string, unknown>)
      .select()
      .single()

    if (error) throw mapSupabaseError(error)

    return mapRow<Budget>(result as Record<string, unknown>)
  }

  async update(id: string, data: Partial<Budget>): Promise<Budget> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update(data as Record<string, unknown>)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") throw new Error(`Budget with id "${id}" not found`)
      throw mapSupabaseError(error)
    }

    return mapRow<Budget>(result as Record<string, unknown>)
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

  async getByUser(userId: string): Promise<Budget[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)

    if (error) throw mapSupabaseError(error)

    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>) as Budget)
  }

  async getByWorkspace(workspaceId: string): Promise<Budget[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("workspace_id", workspaceId)

    if (error) throw mapSupabaseError(error)

    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>) as Budget)
  }

  async getByCategory(categoryId: string): Promise<Budget | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("category_id", categoryId)
      .maybeSingle()

    if (error) throw mapSupabaseError(error)
    if (!data) return null

    return mapRow<Budget>(data as Record<string, unknown>)
  }
}
