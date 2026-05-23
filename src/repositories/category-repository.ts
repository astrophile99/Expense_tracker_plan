import type { SupabaseClient } from "@supabase/supabase-js"
import { SupabaseRepository, mapRow, type FindAllOptions } from "./supabase-repository"
import type { Category, PaginatedResponse } from "@/types"
import { BusinessRuleError } from "@/config/errors"
import { mapSupabaseError } from "@/lib/supabase-error"

export class CategoryRepository extends SupabaseRepository<Category> {
  protected entityName = "Category"
  protected tableName = "categories"
  protected supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    super()
    this.supabase = supabase
  }

  async findAll(options?: FindAllOptions): Promise<PaginatedResponse<Category>> {
    const page = options?.pagination?.page ?? 1
    const limit = options?.pagination?.limit ?? 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = this.supabase
      .from(this.tableName)
      .select("*", { count: "exact" })

    if (options?.filters) {
      const { workspaceId, userId, group, isArchived } = options.filters as Record<string, unknown>
      if (workspaceId) query = query.eq("workspace_id", workspaceId as string)
      if (userId) query = query.eq("user_id", userId as string)
      if (group) query = query.eq("group", group as string)
      if (isArchived !== undefined) query = query.eq("is_archived", isArchived as boolean)
    }

    query = query.order("sort_order", { ascending: true })
    query = query.range(from, to)

    const { data, count, error } = await query
    if (error) throw mapSupabaseError(error)

    const items = (data ?? []).map((row) => mapRow(row as Record<string, unknown>) as Category)

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

  async findById(id: string): Promise<Category | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw mapSupabaseError(error)
    }

    return mapRow<Category>(data as Record<string, unknown>)
  }

  async create(data: Partial<Category>): Promise<Category> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .insert(data as Record<string, unknown>)
      .select()
      .single()

    if (error) throw mapSupabaseError(error)

    return mapRow<Category>(result as Record<string, unknown>)
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const existing = await this.findById(id)
    if (!existing) {
      throw new Error(`Category with id "${id}" not found`)
    }

    if (existing.isDefault && data.isArchived) {
      throw new BusinessRuleError("Cannot archive a default category")
    }

    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update(data as Record<string, unknown>)
      .eq("id", id)
      .select()
      .single()

    if (error) throw mapSupabaseError(error)

    return mapRow<Category>(result as Record<string, unknown>)
  }

  async delete(id: string): Promise<void> {
    const existing = await this.findById(id)
    if (!existing) return

    if (existing.isDefault) {
      throw new BusinessRuleError("Cannot delete a default category")
    }

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

  async getByGroup(group: string): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("group", group)
      .eq("is_archived", false)
      .order("sort_order", { ascending: true })

    if (error) throw mapSupabaseError(error)

    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>) as Category)
  }

  async getDefaults(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("is_default", true)
      .eq("is_archived", false)
      .order("sort_order", { ascending: true })

    if (error) throw mapSupabaseError(error)

    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>) as Category)
  }
}
