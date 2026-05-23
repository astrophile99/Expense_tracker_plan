import { BudgetRepository, TransactionRepository } from "@/repositories"
import { ActivityService } from "./activity-service"
import { NotificationService } from "./notification-service"
import type { Budget, ApiResult, Transaction } from "@/types"
import type { CreateBudgetInput, UpdateBudgetInput } from "@/schemas/validation"
import { ActivityType, NotificationType, TransactionType } from "@/types"
import { createBudgetSchema, updateBudgetSchema } from "@/schemas/validation"
import { appConfig } from "@/config/app"

export class BudgetService {
  constructor(
    private budgetRepo: BudgetRepository,
    private transactionRepo: TransactionRepository,
    private activityService: ActivityService,
    private notificationService: NotificationService
  ) {}

  private enrichBudget(budget: Budget, transactions: Transaction[]): Budget & { spent: number; remaining: number; percentageUsed: number } {
    const spent = transactions
      .filter((t) => t.type === TransactionType.EXPENSE && t.categoryId === budget.categoryId)
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      ...budget,
      spent,
      remaining: Math.max(0, budget.amount - spent),
      percentageUsed: budget.amount > 0 ? Math.min(Math.round((spent / budget.amount) * 1000) / 10, 100) : 0,
    }
  }

  async list(userId: string, workspaceId?: string): Promise<ApiResult<Budget[]>> {
    const result = await this.budgetRepo.findAll({
      filters: { userId, workspaceId },
    })

    const enriched = result.data.map((b) => this.enrichBudget(b, this.transactionRepo.getStore()))

    return { success: true, data: enriched }
  }

  async getById(id: string, userId: string): Promise<ApiResult<Budget>> {
    const budget = await this.budgetRepo.findById(id)
    if (!budget) {
      return { success: false, error: { code: "BUDGET_NOT_FOUND", message: "Budget not found", statusCode: 404 } }
    }

    const enriched = this.enrichBudget(budget, this.transactionRepo.getStore())
    return { success: true, data: enriched }
  }

  async create(input: CreateBudgetInput, userId: string): Promise<ApiResult<Budget>> {
    const parsed = createBudgetSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid budget data",
          statusCode: 400,
          details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        },
      }
    }

    const budget = await this.budgetRepo.create({ ...parsed.data, userId })

    await this.activityService.log({
      userId,
      workspaceId: budget.workspaceId,
      type: ActivityType.BUDGET_CREATED,
      metadata: { budgetId: budget.id, categoryId: budget.categoryId, amount: budget.amount },
    })

    return { success: true, data: budget, message: "Budget created" }
  }

  async update(id: string, input: UpdateBudgetInput, userId: string): Promise<ApiResult<Budget>> {
    const parsed = updateBudgetSchema.safeParse(input)
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

    const updated = await this.budgetRepo.update(id, parsed.data)

    await this.activityService.log({
      userId,
      workspaceId: updated.workspaceId,
      type: ActivityType.BUDGET_UPDATED,
      metadata: { budgetId: id, changes: Object.keys(parsed.data) },
    })

    return { success: true, data: updated, message: "Budget updated" }
  }

  async delete(id: string, userId: string): Promise<ApiResult<void>> {
    await this.budgetRepo.delete(id)

    const budget = await this.budgetRepo.findById(id)
    await this.activityService.log({
      userId,
      workspaceId: budget?.workspaceId,
      type: ActivityType.BUDGET_DELETED,
      metadata: { budgetId: id },
    })

    return { success: true, data: undefined, message: "Budget deleted" }
  }

  async checkBudgetAlerts(userId: string): Promise<ApiResult<{ alertCount: number }>> {
    const result = await this.budgetRepo.findAll({ filters: { userId } })
    let alertCount = 0

    for (const budget of result.data) {
      const enriched = this.enrichBudget(budget, this.transactionRepo.getStore())
      if (enriched.percentageUsed >= (enriched.alertThreshold ?? 80)) {
        alertCount++
        await this.notificationService.create({
          userId,
          type: NotificationType.BUDGET_ALERT,
          title: "Budget Alert",
          message: `${enriched.spent && enriched.amount ? `${Math.round((enriched.spent / enriched.amount) * 100)}%` : ""} of budget used for category`,
          actionUrl: "/budgets",
          actionLabel: "View Budgets",
        })

        if (enriched.percentageUsed >= 100) {
          await this.notificationService.create({
            userId,
            type: NotificationType.BUDGET_EXCEEDED,
            title: "Budget Exceeded",
            message: "Budget has been exceeded for one of your categories",
            actionUrl: "/budgets",
            actionLabel: "View Budgets",
          })
        }
      }
    }

    return { success: true, data: { alertCount } }
  }
}
