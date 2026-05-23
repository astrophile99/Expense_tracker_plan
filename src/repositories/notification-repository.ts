import type { SupabaseClient } from "@supabase/supabase-js"
import { SupabaseRepository, mapRow, type FindAllOptions } from "./supabase-repository"
import type { Notification, PaginatedResponse } from "@/types"
import { NotFoundError } from "@/config/errors"
import { mapSupabaseError } from "@/lib/supabase-error"

export class NotificationRepository extends SupabaseRepository<Notification> {
  protected entityName = "Notification"
  protected tableName = "notifications"
  protected supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    super()
    this.supabase = supabase
  }

  async findAll(options?: FindAllOptions): Promise<PaginatedResponse<Notification>> {
    const page = options?.pagination?.page ?? 1
    const limit = options?.pagination?.limit ?? 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = this.supabase
      .from(this.tableName)
      .select("*", { count: "exact" })

    if (options?.filters) {
      const { userId, type, isRead } = options.filters as Record<string, unknown>
      if (userId) query = query.eq("user_id", userId as string)
      if (type) query = query.eq("type", type as string)
      if (isRead !== undefined) query = query.eq("is_read", isRead as boolean)
    }

    query = query.order("created_at", { ascending: false })
    query = query.range(from, to)

    const { data, count, error } = await query
    if (error) throw mapSupabaseError(error)

    const items = (data ?? []).map((row) => mapRow(row as Record<string, unknown>) as Notification)

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

  async findById(id: string): Promise<Notification | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw mapSupabaseError(error)
    }

    return mapRow<Notification>(data as Record<string, unknown>)
  }

  async create(data: Partial<Notification>): Promise<Notification> {
    const dbData: Record<string, unknown> = {
      user_id: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      action_url: data.actionUrl ?? null,
      action_label: data.actionLabel ?? null,
    }

    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .insert(dbData)
      .select()
      .single()

    if (error) throw mapSupabaseError(error)

    return mapRow<Notification>(result as Record<string, unknown>)
  }

  async update(id: string, data: Partial<Notification>): Promise<Notification> {
    const dbData: Record<string, unknown> = {}
    if (data.isRead !== undefined) dbData.is_read = data.isRead

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

    return mapRow<Notification>(result as Record<string, unknown>)
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

  async markAsRead(id: string): Promise<Notification> {
    return this.update(id, { isRead: true })
  }

  async markAllAsRead(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)
      .select()

    if (error) throw mapSupabaseError(error)
    return data?.length ?? 0
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from(this.tableName)
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false)

    if (error) throw mapSupabaseError(error)
    return count ?? 0
  }
}
