import { NotificationRepository } from "@/repositories"
import type { Notification, NotificationType } from "@/types"
import type { CreateNotificationInput } from "@/schemas/validation"

export class NotificationService {
  constructor(private repo: NotificationRepository) {}

  async create(input: CreateNotificationInput): Promise<Notification> {
    return this.repo.create({ ...input, type: input.type as NotificationType })
  }

  async list(userId: string, page = 1, limit = 20): Promise<{
    data: Notification[]
    total: number
    unreadCount: number
    page: number
    limit: number
  }> {
    const result = await this.repo.findAll({
      filters: { userId },
      pagination: { page, limit },
    })

    const unreadCount = await this.repo.getUnreadCount(userId)

    return {
      data: result.data,
      total: result.total,
      unreadCount,
      page: result.page,
      limit: result.limit,
    }
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    return this.repo.markAsRead(id)
  }

  async markAllAsRead(userId: string): Promise<number> {
    return this.repo.markAllAsRead(userId)
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repo.getUnreadCount(userId)
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id)
  }
}
