import { TransactionRepository } from "@/repositories"
import { ActivityService } from "./activity-service"
import { NotificationService } from "./notification-service"
import type { Transaction, TransactionFilters, PaginatedResponse, ApiResult } from "@/types"
import { TransactionType, ActivityType, NotificationType } from "@/types"
import { BusinessRuleError, ForbiddenError } from "@/config/errors"
import { createTransactionSchema, updateTransactionSchema, type CreateTransactionInput, type UpdateTransactionInput } from "@/schemas/validation"

export class TransactionService {
  constructor(
    private repo: TransactionRepository,
    private activityService: ActivityService,
    private notificationService: NotificationService
  ) {}

  async list(filters: TransactionFilters, page: number, limit: number, userId: string): Promise<ApiResult<PaginatedResponse<Transaction>>> {
    const result = await this.repo.findAll({
      filters: { ...filters, createdBy: userId } as Record<string, unknown>,
      pagination: { page, limit },
    })

    return { success: true, data: result }
  }

  async getById(id: string, userId: string): Promise<ApiResult<Transaction>> {
    const transaction = await this.repo.findById(id)
    if (!transaction) {
      return { success: false, error: { code: "TRANSACTION_NOT_FOUND", message: "Transaction not found", statusCode: 404 } }
    }
    if (transaction.createdBy !== userId) {
      return { success: false, error: { code: "FORBIDDEN", message: "You can only view your own transactions", statusCode: 403 } }
    }
    return { success: true, data: transaction }
  }

  async create(input: CreateTransactionInput, userId: string, userName?: string): Promise<ApiResult<Transaction>> {
    const parsed = createTransactionSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid transaction data",
          statusCode: 400,
          details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        },
      }
    }

    if (parsed.data.amount <= 0) {
      return { success: false, error: { code: "VALIDATION_ERROR", message: "Amount must be positive", statusCode: 400 } }
    }

    const transaction = await this.repo.create({
      ...parsed.data as unknown as Partial<Transaction>,
      createdBy: userId,
    })

    await this.activityService.log({
      userId,
      workspaceId: transaction.workspaceId,
      type: ActivityType.TRANSACTION_CREATED,
      metadata: { transactionId: transaction.id, amount: transaction.amount, type: transaction.type },
    })

    await this.notificationService.create({
      userId,
      type: NotificationType.TRANSACTION_ADDED,
      title: "Transaction Added",
      message: `${transaction.description} — ${transaction.amount}`,
      actionUrl: `/transactions/${transaction.id}`,
      actionLabel: "View Transaction",
    })

    return { success: true, data: transaction, message: "Transaction created" }
  }

  async update(id: string, input: UpdateTransactionInput, userId: string): Promise<ApiResult<Transaction>> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      return { success: false, error: { code: "TRANSACTION_NOT_FOUND", message: "Transaction not found", statusCode: 404 } }
    }
    if (existing.createdBy !== userId) {
      return { success: false, error: { code: "FORBIDDEN", message: "You can only update your own transactions", statusCode: 403 } }
    }

    const parsed = updateTransactionSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid update data",
          statusCode: 400,
          details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        },
      }
    }

    const updated = await this.repo.update(id, parsed.data as unknown as Partial<Transaction>)

    await this.activityService.log({
      userId,
      workspaceId: updated.workspaceId,
      type: ActivityType.TRANSACTION_UPDATED,
      metadata: { transactionId: id, previousAmount: existing.amount, newAmount: updated.amount },
    })

    return { success: true, data: updated, message: "Transaction updated" }
  }

  async delete(id: string, userId: string): Promise<ApiResult<void>> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      return { success: false, error: { code: "TRANSACTION_NOT_FOUND", message: "Transaction not found", statusCode: 404 } }
    }
    if (existing.createdBy !== userId) {
      return { success: false, error: { code: "FORBIDDEN", message: "You can only delete your own transactions", statusCode: 403 } }
    }

    await this.repo.delete(id)

    await this.activityService.log({
      userId,
      workspaceId: existing.workspaceId,
      type: ActivityType.TRANSACTION_DELETED,
      metadata: { transactionId: id, amount: existing.amount, type: existing.type },
    })

    return { success: true, data: undefined, message: "Transaction deleted" }
  }

  async getStats(userId: string): Promise<ApiResult<Record<string, number>>> {
    const stats = await this.repo.getDashboardStats(userId)
    return {
      success: true,
      data: {
        ...stats,
        savingsRate: stats.totalIncome > 0
          ? Math.round(((stats.totalIncome - stats.totalExpenses) / stats.totalIncome) * 1000) / 10
          : 0,
      },
    }
  }
}
