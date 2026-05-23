import type { SupabaseClient } from "@supabase/supabase-js"
import { BaseRepository, type FindAllOptions, type Repository } from "./base"
import type { Timestamps, PaginatedResponse } from "@/types"
import { NotFoundError } from "@/config/errors"

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

export function mapRow<T = Record<string, unknown>>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(row)) {
    result[toCamelCase(key)] = value
  }
  return result as T
}

export function mapToDb(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (key === "id") continue
    result[toSnakeCase(key)] = value
  }
  return result
}

export abstract class SupabaseRepository<T extends Timestamps>
  extends BaseRepository<T>
  implements Repository<T>
{
  protected abstract tableName: string
  protected abstract supabase: SupabaseClient

  async findAll(options?: FindAllOptions): Promise<PaginatedResponse<T>> {
    const page = options?.pagination?.page ?? 1
    const limit = options?.pagination?.limit ?? 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = this.supabase
      .from(this.tableName)
      .select("*", { count: "exact" })
      .range(from, to)

    if (options?.pagination?.sortBy) {
      query = query.order(toSnakeCase(options.pagination.sortBy), {
        ascending: options.pagination.sortOrder === "asc",
      })
    }

    const { data, count, error } = await query

    if (error) throw error

    const items = (data ?? []).map((row) => mapRow(row as Record<string, unknown>) as T)

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

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }

    return mapRow<T>(data as Record<string, unknown>)
  }

  async create(data: Partial<T>): Promise<T> {
    const dbData = mapToDb(data as Record<string, unknown>)
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .insert(dbData)
      .select()
      .single()

    if (error) throw error

    return mapRow<T>(result as Record<string, unknown>)
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const dbData = mapToDb(data as Record<string, unknown>)
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update(dbData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") throw new NotFoundError(this.entityName, id)
      throw error
    }

    return mapRow<T>(result as Record<string, unknown>)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq("id", id)

    if (error) throw error
  }

  async count(filters?: Record<string, unknown>): Promise<number> {
    let query = this.supabase
      .from(this.tableName)
      .select("*", { count: "exact", head: true })

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(toSnakeCase(key), value)
      }
    }

    const { count, error } = await query

    if (error) throw error

    return count ?? 0
  }

  async findByField(field: string, value: unknown): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq(toSnakeCase(field), value)
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    return mapRow<T>(data as Record<string, unknown>)
  }

  async findByFields(fields: Record<string, unknown>): Promise<T | null> {
    let query = this.supabase.from(this.tableName).select("*")

    for (const [key, value] of Object.entries(fields)) {
      query = query.eq(toSnakeCase(key), value)
    }

    const { data, error } = await query.maybeSingle()

    if (error) throw error
    if (!data) return null

    return mapRow<T>(data as Record<string, unknown>)
  }
}
