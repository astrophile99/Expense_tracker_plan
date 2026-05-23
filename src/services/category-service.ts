import { CategoryRepository } from "@/repositories"
import { ActivityService } from "./activity-service"
import type { Category, ApiResult } from "@/types"
import type { CreateCategoryInput, UpdateCategoryInput } from "@/schemas/validation"
import { ActivityType } from "@/types"
import { createCategorySchema, updateCategorySchema } from "@/schemas/validation"
import { appConfig } from "@/config/app"

export class CategoryService {
  constructor(
    private repo: CategoryRepository,
    private activityService: ActivityService
  ) {}

  async list(workspaceId?: string, userId?: string): Promise<ApiResult<Category[]>> {
    const result = await this.repo.findAll({
      filters: { workspaceId, userId, isArchived: false },
    })
    return { success: true, data: result.data }
  }

  async getDefaults(): Promise<ApiResult<Category[]>> {
    const defaults = await this.repo.getDefaults()
    return { success: true, data: defaults }
  }

  async create(input: CreateCategoryInput, userId: string): Promise<ApiResult<Category>> {
    const parsed = createCategorySchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid category data",
          statusCode: 400,
          details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        },
      }
    }

    const existingCount = parsed.data.workspaceId
      ? await this.repo.count({ workspaceId: parsed.data.workspaceId })
      : await this.repo.count({ userId })

    if (existingCount >= appConfig.limits.maxCategoriesPerWorkspace) {
      return {
        success: false,
        error: {
          code: "CATEGORY_LIMIT_REACHED",
          message: `Maximum of ${appConfig.limits.maxCategoriesPerWorkspace} categories reached`,
          statusCode: 422,
        },
      }
    }

    const category = await this.repo.create({ ...parsed.data })

    await this.activityService.log({
      userId,
      workspaceId: category.workspaceId,
      type: ActivityType.CATEGORY_CREATED,
      metadata: { categoryId: category.id, name: category.name },
    })

    return { success: true, data: category, message: "Category created" }
  }

  async update(id: string, input: UpdateCategoryInput, userId: string): Promise<ApiResult<Category>> {
    const parsed = updateCategorySchema.safeParse(input)
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

    const updated = await this.repo.update(id, parsed.data)

    await this.activityService.log({
      userId,
      workspaceId: updated.workspaceId,
      type: ActivityType.CATEGORY_UPDATED,
      metadata: { categoryId: id, changes: Object.keys(parsed.data) },
    })

    return { success: true, data: updated, message: "Category updated" }
  }

  async delete(id: string, userId: string): Promise<ApiResult<void>> {
    await this.repo.delete(id)

    const cat = await this.repo.findById(id)
    await this.activityService.log({
      userId,
      workspaceId: cat?.workspaceId,
      type: ActivityType.CATEGORY_DELETED,
      metadata: { categoryId: id },
    })

    return { success: true, data: undefined, message: "Category deleted" }
  }
}
