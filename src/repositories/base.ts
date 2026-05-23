import type { PaginationParams, PaginatedResponse, Timestamps } from "@/types"
import { NotFoundError } from "@/config/errors"

export interface FindAllOptions {
  filters?: Record<string, unknown>
  pagination?: PaginationParams
  includes?: string[]
}

export interface Repository<T extends Timestamps> {
  findAll(options?: FindAllOptions): Promise<PaginatedResponse<T>>
  findById(id: string): Promise<T | null>
  findByIdOrThrow(id: string): Promise<T>
  create(data: Partial<T>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
  count(filters?: Record<string, unknown>): Promise<number>
  exists(id: string): Promise<boolean>
}

export abstract class BaseRepository<T extends Timestamps> implements Repository<T> {
  protected abstract entityName: string

  abstract findAll(options?: FindAllOptions): Promise<PaginatedResponse<T>>
  abstract findById(id: string): Promise<T | null>

  async findByIdOrThrow(id: string): Promise<T> {
    const entity = await this.findById(id)
    if (!entity) throw new NotFoundError(this.entityName, id)
    return entity
  }

  abstract create(data: Partial<T>): Promise<T>
  abstract update(id: string, data: Partial<T>): Promise<T>
  abstract delete(id: string): Promise<void>
  abstract count(filters?: Record<string, unknown>): Promise<number>

  async exists(id: string): Promise<boolean> {
    try {
      await this.findByIdOrThrow(id)
      return true
    } catch {
      return false
    }
  }

  protected applyPagination<TItem>(items: TItem[], pagination?: PaginationParams): PaginatedResponse<TItem> {
    const page = pagination?.page ?? 1
    const limit = pagination?.limit ?? 20
    const total = items.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const data = items.slice(start, start + limit)

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
  }

  protected generateId(): string {
    return crypto.randomUUID()
  }

  protected timestamps(): Timestamps {
    return {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  protected touch(entity: Partial<T>): Partial<T> {
    return { ...entity, updatedAt: new Date().toISOString() } as Partial<T>
  }
}
