import { BaseRepository, type FindAllOptions } from "./base"
import type { Workspace, WorkspaceMember, WorkspaceInvitation, PaginatedResponse } from "@/types"
import { WorkspaceRole } from "@/types"
import { NotFoundError, BusinessRuleError, ConflictError } from "@/config/errors"

export class WorkspaceRepository extends BaseRepository<Workspace> {
  protected entityName = "Workspace"

  private workspaces: Workspace[] = []
  private members: WorkspaceMember[] = []
  private invitations: WorkspaceInvitation[] = []

  async findAll(options?: FindAllOptions): Promise<PaginatedResponse<Workspace>> {
    return this.applyPagination(this.workspaces, options?.pagination)
  }

  async findById(id: string): Promise<Workspace | null> {
    return this.workspaces.find((w) => w.id === id) ?? null
  }

  async create(data: Partial<Workspace>): Promise<Workspace> {
    const now = this.timestamps()
    const workspace: Workspace = {
      id: this.generateId(),
      name: "",
      createdBy: "",
      ...data,
      ...now,
    } as Workspace

    this.workspaces.push(workspace)

    this.members.push({
      id: this.generateId(),
      workspaceId: workspace.id,
      userId: workspace.createdBy,
      role: WorkspaceRole.OWNER,
      joinedAt: now.createdAt,
    })

    return workspace
  }

  async update(id: string, data: Partial<Workspace>): Promise<Workspace> {
    const index = this.workspaces.findIndex((w) => w.id === id)
    if (index === -1) throw new NotFoundError("Workspace", id)
    const updated = { ...this.workspaces[index], ...this.touch(data) } as Workspace
    this.workspaces[index] = updated
    return updated
  }

  async delete(id: string): Promise<void> {
    const index = this.workspaces.findIndex((w) => w.id === id)
    if (index === -1) throw new NotFoundError("Workspace", id)
    this.workspaces.splice(index, 1)
    this.members = this.members.filter((m) => m.workspaceId !== id)
    this.invitations = this.invitations.filter((inv) => inv.workspaceId !== id)
  }

  async count(): Promise<number> {
    return this.workspaces.length
  }

  // ──────────────────────
  // MEMBERS
  // ──────────────────────

  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return this.members.filter((m) => m.workspaceId === workspaceId)
  }

  async getMember(workspaceId: string, userId: string): Promise<WorkspaceMember | null> {
    return this.members.find((m) => m.workspaceId === workspaceId && m.userId === userId) ?? null
  }

  async addMember(workspaceId: string, userId: string, role: WorkspaceRole = WorkspaceRole.MEMBER, invitedBy?: string): Promise<WorkspaceMember> {
    const existing = await this.getMember(workspaceId, userId)
    if (existing) throw new ConflictError("User is already a member of this workspace")

    const member: WorkspaceMember = {
      id: this.generateId(),
      workspaceId,
      userId,
      role,
      joinedAt: new Date().toISOString(),
      invitedBy,
    }
    this.members.push(member)
    return member
  }

  async updateMemberRole(workspaceId: string, userId: string, role: WorkspaceRole): Promise<WorkspaceMember> {
    const member = this.members.find((m) => m.workspaceId === workspaceId && m.userId === userId)
    if (!member) throw new NotFoundError("WorkspaceMember")
    if (member.role === WorkspaceRole.OWNER && role !== WorkspaceRole.OWNER) {
      throw new BusinessRuleError("Cannot change the owner's role")
    }
    member.role = role
    return member
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    const index = this.members.findIndex((m) => m.workspaceId === workspaceId && m.userId === userId)
    if (index === -1) throw new NotFoundError("WorkspaceMember")
    if (this.members[index].role === WorkspaceRole.OWNER) {
      throw new BusinessRuleError("Cannot remove the workspace owner")
    }
    this.members.splice(index, 1)
  }

  async getMemberCount(workspaceId: string): Promise<number> {
    return this.members.filter((m) => m.workspaceId === workspaceId).length
  }

  // ──────────────────────
  // INVITATIONS
  // ──────────────────────

  async getInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
    return this.invitations.filter((inv) => inv.workspaceId === workspaceId)
  }

  async createInvitation(invitation: Partial<WorkspaceInvitation>): Promise<WorkspaceInvitation> {
    const inv: WorkspaceInvitation = {
      id: this.generateId(),
      workspaceId: invitation.workspaceId!,
      email: invitation.email!,
      role: invitation.role ?? WorkspaceRole.MEMBER,
      invitedBy: invitation.invitedBy!,
      status: "pending" as WorkspaceInvitation["status"],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.invitations.push(inv)
    return inv
  }

  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    const workspaceIds = this.members
      .filter((m) => m.userId === userId)
      .map((m) => m.workspaceId)
    return this.workspaces.filter((w) => workspaceIds.includes(w.id))
  }

  getUserRole(workspaceId: string, userId: string): WorkspaceRole | null {
    const member = this.members.find((m) => m.workspaceId === workspaceId && m.userId === userId)
    return member?.role ?? null
  }
}
