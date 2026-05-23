import { WorkspaceRepository } from "@/repositories"
import { ActivityService } from "./activity-service"
import type {
  Workspace, WorkspaceMember, ApiResult,
} from "@/types"
import type { CreateWorkspaceInput, UpdateWorkspaceInput, InviteMemberInput } from "@/schemas/validation"
import { WorkspaceRole, ActivityType } from "@/types"
import { BusinessRuleError, ForbiddenError, NotFoundError } from "@/config/errors"
import { appConfig } from "@/config/app"
import { createWorkspaceSchema, updateWorkspaceSchema, inviteMemberSchema, updateMemberRoleSchema } from "@/schemas/validation"

export class WorkspaceService {
  constructor(
    private repo: WorkspaceRepository,
    private activityService: ActivityService
  ) {}

  async list(userId: string): Promise<ApiResult<Workspace[]>> {
    const workspaces = await this.repo.getUserWorkspaces(userId)
    return { success: true, data: workspaces }
  }

  async getById(id: string, userId: string): Promise<ApiResult<Workspace>> {
    const workspace = await this.repo.findById(id)
    if (!workspace) {
      return { success: false, error: { code: "WORKSPACE_NOT_FOUND", message: "Workspace not found", statusCode: 404 } }
    }

    const role = await this.repo.getUserRole(id, userId)
    if (!role) {
      return { success: false, error: { code: "FORBIDDEN", message: "Not a member of this workspace", statusCode: 403 } }
    }

    const memberCount = await this.repo.getMemberCount(id)
    return { success: true, data: { ...workspace, memberCount } }
  }

  async create(input: CreateWorkspaceInput, userId: string): Promise<ApiResult<Workspace>> {
    const parsed = createWorkspaceSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid workspace data",
          statusCode: 400,
          details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        },
      }
    }

    const userWorkspaces = await this.repo.getUserWorkspaces(userId)
    if (userWorkspaces.length >= appConfig.limits.maxWorkspacesPerUser) {
      return {
        success: false,
        error: {
          code: "WORKSPACE_LIMIT_REACHED",
          message: `Maximum of ${appConfig.limits.maxWorkspacesPerUser} workspaces reached`,
          statusCode: 422,
        },
      }
    }

    const workspace = await this.repo.create({ ...parsed.data, createdBy: userId })

    await this.activityService.log({
      userId,
      workspaceId: workspace.id,
      type: ActivityType.WORKSPACE_CREATED,
      metadata: { workspaceName: workspace.name },
    })

    return { success: true, data: workspace, message: "Workspace created" }
  }

  async update(id: string, input: UpdateWorkspaceInput, userId: string): Promise<ApiResult<Workspace>> {
    const role = await this.repo.getUserRole(id, userId)
    if (!role || (role !== WorkspaceRole.OWNER && role !== WorkspaceRole.ADMIN)) {
      return { success: false, error: { code: "FORBIDDEN", message: "Only admins can update workspace", statusCode: 403 } }
    }

    const parsed = updateWorkspaceSchema.safeParse(input)
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
      workspaceId: id,
      type: ActivityType.WORKSPACE_UPDATED,
      metadata: { changes: Object.keys(parsed.data) },
    })

    return { success: true, data: updated, message: "Workspace updated" }
  }

  async delete(id: string, userId: string): Promise<ApiResult<void>> {
    const role = await this.repo.getUserRole(id, userId)
    if (role !== WorkspaceRole.OWNER) {
      return { success: false, error: { code: "FORBIDDEN", message: "Only owners can delete workspace", statusCode: 403 } }
    }

    await this.repo.delete(id)

    await this.activityService.log({
      userId,
      workspaceId: id,
      type: ActivityType.WORKSPACE_DELETED,
      metadata: {},
    })

    return { success: true, data: undefined, message: "Workspace deleted" }
  }

  async getMembers(workspaceId: string, userId: string): Promise<ApiResult<WorkspaceMember[]>> {
    const role = await this.repo.getUserRole(workspaceId, userId)
    if (!role) {
      return { success: false, error: { code: "FORBIDDEN", message: "Not a member of this workspace", statusCode: 403 } }
    }

    const members = await this.repo.getMembers(workspaceId)
    return { success: true, data: members }
  }

  async inviteMember(workspaceId: string, input: InviteMemberInput, userId: string): Promise<ApiResult<WorkspaceMember>> {
    const role = await this.repo.getUserRole(workspaceId, userId)
    if (!role || (role !== WorkspaceRole.OWNER && role !== WorkspaceRole.ADMIN)) {
      return { success: false, error: { code: "FORBIDDEN", message: "Only admins can invite members", statusCode: 403 } }
    }

    const parsed = inviteMemberSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid invitation data", statusCode: 400, details: parsed.error.flatten().fieldErrors as Record<string, string[]> },
      }
    }

    const memberCount = await this.repo.getMemberCount(workspaceId)
    if (memberCount >= appConfig.limits.maxMembersPerWorkspace) {
      return {
        success: false,
        error: { code: "MEMBER_LIMIT_REACHED", message: `Maximum of ${appConfig.limits.maxMembersPerWorkspace} members reached`, statusCode: 422 },
      }
    }

    await this.repo.createInvitation({
      workspaceId,
      email: parsed.data.email,
      role: parsed.data.role,
      invitedBy: userId,
    })

    return { success: true, data: undefined as unknown as WorkspaceMember, message: "Invitation sent" }
  }

  async removeMember(workspaceId: string, targetUserId: string, userId: string): Promise<ApiResult<void>> {
    const role = await this.repo.getUserRole(workspaceId, userId)
    if (!role || (role !== WorkspaceRole.OWNER && role !== WorkspaceRole.ADMIN)) {
      return { success: false, error: { code: "FORBIDDEN", message: "Only admins can remove members", statusCode: 403 } }
    }

    const targetRole = await this.repo.getUserRole(workspaceId, targetUserId)
    if (targetRole === WorkspaceRole.OWNER) {
      return { success: false, error: { code: "CANNOT_REMOVE_OWNER", message: "Cannot remove the workspace owner", statusCode: 422 } }
    }

    await this.repo.removeMember(workspaceId, targetUserId)

    await this.activityService.log({
      userId,
      workspaceId,
      type: ActivityType.MEMBER_REMOVED,
      metadata: { removedUserId: targetUserId },
    })

    return { success: true, data: undefined, message: "Member removed" }
  }

  async updateMemberRole(workspaceId: string, targetUserId: string, newRole: WorkspaceRole, userId: string): Promise<ApiResult<WorkspaceMember>> {
    const role = await this.repo.getUserRole(workspaceId, userId)
    if (!role || (role !== WorkspaceRole.OWNER && role !== WorkspaceRole.ADMIN)) {
      return { success: false, error: { code: "FORBIDDEN", message: "Only admins can change roles", statusCode: 403 } }
    }

    const parsed = updateMemberRoleSchema.safeParse({ role: newRole })
    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid role", statusCode: 400, details: parsed.error.flatten().fieldErrors as Record<string, string[]> },
      }
    }

    const updated = await this.repo.updateMemberRole(workspaceId, targetUserId, parsed.data.role)

    await this.activityService.log({
      userId,
      workspaceId,
      type: ActivityType.ROLE_CHANGED,
      metadata: { targetUserId, newRole: parsed.data.role },
    })

    return { success: true, data: updated, message: "Role updated" }
  }
}
