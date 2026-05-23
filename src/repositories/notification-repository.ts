import { BaseRepository, type FindAllOptions } from "./base"
import type { Notification, PaginatedResponse } from "@/types"
import { NotFoundError } from "@/config/errors"

export class NotificationRepository extends BaseRepository<Notification> {
  protected entityName = "Notification"

  private store: Notification[] = []

  async findAll(options?: FindAllOptions): Promise<PaginatedResponse<Notification>> {
    let filtered = [...this.store]

    if (options?.filters) {
      const { userId, type, isRead } = options.filters as Record<string, unknown>
      if (userId) filtered = filtered.filter((n) => n.userId === userId)
      if (type) filtered = filtered.filter((n) => n.type === type)
      if (isRead !== undefined) filtered = filtered.filter((n) => n.isRead === isRead)
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return this.applyPagination(filtered, options?.pagination)
  }

  async findById(id: string): Promise<Notification | null> {
    return this.store.find((n) => n.id === id) ?? null
  }

  async create(data: Partial<Notification>): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      userId: data.userId!,
      type: data.type!,
      title: data.title!,
      message: data.message!,
      isRead: false,
      actionUrl: data.actionUrl,
      actionLabel: data.actionLabel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.store.unshift(notification)
    return notification
  }

  async update(id: string, data: Partial<Notification>): Promise<Notification> {
    const index = this.store.findIndex((n) => n.id === id)
    if (index === -1) throw new NotFoundError("Notification", id)
    const updated = { ...this.store[index], ...data }
    this.store[index] = updated
    return updated
  }

  async delete(id: string): Promise<void> {
    const index = this.store.findIndex((n) => n.id === id)
    if (index === -1) throw new NotFoundError("Notification", id)
    this.store.splice(index, 1)
  }

  async count(filters?: Record<string, unknown>): Promise<number> {
    let filtered = [...this.store]
    if (filters?.userId) filtered = filtered.filter((n) => n.userId === filters.userId)
    return filtered.length
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.update(id, { isRead: true })
  }

  async markAllAsRead(userId: string): Promise<number> {
    let count = 0
    this.store = this.store.map((n) => {
      if (n.userId === userId && !n.isRead) {
        count++
        return { ...n, isRead: true }
      }
      return n
    })
    return count
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.store.filter((n) => n.userId === userId && !n.isRead).length
  }
}
