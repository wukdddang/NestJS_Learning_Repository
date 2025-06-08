import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workspace, WorkspaceDocument } from './schemas/workspace.schema';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(@InjectModel(Workspace.name) private workspaceModel: Model<WorkspaceDocument>) {}

  // 워크스페이스 생성
  async create(createWorkspaceDto: CreateWorkspaceDto, userId: string): Promise<Workspace> {
    const workspaceData = {
      ...createWorkspaceDto,
      owner: new Types.ObjectId(userId),
      members: [new Types.ObjectId(userId)], // 생성자를 멤버로 추가
    };

    const createdWorkspace = new this.workspaceModel(workspaceData);
    return createdWorkspace.save();
  }

  // 사용자의 워크스페이스 목록 조회
  async findByUser(userId: string): Promise<Workspace[]> {
    return this.workspaceModel
      .find({
        $or: [{ owner: new Types.ObjectId(userId) }, { members: new Types.ObjectId(userId) }],
        isActive: true,
      })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .exec();
  }

  // 워크스페이스 상세 조회
  async findOne(id: string, userId: string): Promise<Workspace> {
    const workspace = await this.workspaceModel
      .findById(id)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .exec();

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }

    // 접근 권한 확인
    if (!this.hasWorkspaceAccess(workspace, userId)) {
      throw new ForbiddenException('Access denied to this workspace');
    }

    return workspace;
  }

  // 워크스페이스 업데이트
  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto, userId: string): Promise<Workspace> {
    const existingWorkspace = await this.findOne(id, userId);

    // 소유자만 수정 가능
    if (existingWorkspace.owner.toString() !== userId) {
      throw new ForbiddenException('Only workspace owner can update the workspace');
    }

    const workspace = await this.workspaceModel
      .findByIdAndUpdate(id, updateWorkspaceDto, { new: true })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .exec();

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }

    return workspace;
  }

  // 워크스페이스 삭제 (소프트 삭제)
  async remove(id: string, userId: string): Promise<Workspace> {
    const existingWorkspace = await this.findOne(id, userId);

    // 소유자만 삭제 가능
    if (existingWorkspace.owner.toString() !== userId) {
      throw new ForbiddenException('Only workspace owner can delete the workspace');
    }

    const workspace = await this.workspaceModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }

    return workspace;
  }

  // 멤버 추가
  async addMember(workspaceId: string, userId: string, memberId: string): Promise<Workspace> {
    const workspace = await this.findOne(workspaceId, userId);

    // 소유자만 멤버 추가 가능
    if (workspace.owner.toString() !== userId) {
      throw new ForbiddenException('Only workspace owner can add members');
    }

    // 이미 멤버인지 확인
    const memberExists = workspace.members.some((member) => member.toString() === memberId);
    if (memberExists) {
      throw new ForbiddenException('User is already a member of this workspace');
    }

    const updatedWorkspace = await this.workspaceModel
      .findByIdAndUpdate(workspaceId, { $push: { members: new Types.ObjectId(memberId) } }, { new: true })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .exec();

    if (!updatedWorkspace) {
      throw new NotFoundException(`Workspace with ID ${workspaceId} not found`);
    }

    return updatedWorkspace;
  }

  // 멤버 제거
  async removeMember(workspaceId: string, userId: string, memberId: string): Promise<Workspace> {
    const workspace = await this.findOne(workspaceId, userId);

    // 소유자만 멤버 제거 가능 (단, 자신을 제거하는 경우는 허용)
    if (workspace.owner.toString() !== userId && userId !== memberId) {
      throw new ForbiddenException('Only workspace owner can remove members');
    }

    // 소유자는 자신을 제거할 수 없음
    if (workspace.owner.toString() === memberId) {
      throw new ForbiddenException('Workspace owner cannot be removed');
    }

    const updatedWorkspace = await this.workspaceModel
      .findByIdAndUpdate(workspaceId, { $pull: { members: new Types.ObjectId(memberId) } }, { new: true })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .exec();

    if (!updatedWorkspace) {
      throw new NotFoundException(`Workspace with ID ${workspaceId} not found`);
    }

    return updatedWorkspace;
  }

  async getMembers(workspaceId: string, userId: string): Promise<any[]> {
    const workspace = await this.findOne(workspaceId, userId);

    return [
      {
        userId: workspace.owner,
        role: 'owner',
        user: workspace.owner,
      },
      ...workspace.members.map((member) => ({
        userId: member,
        role: 'member',
        user: member,
      })),
    ];
  }

  async getWorkspaceStats(workspaceId: string, userId: string): Promise<any> {
    const workspace = await this.findOne(workspaceId, userId);

    // 추후 실제 통계 계산 로직 구현
    return {
      workspaceId,
      name: workspace.name,
      totalProjects: 0,
      totalMembers: workspace.members.length,
      totalTasks: 0,
      completedTasks: 0,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }

  // 접근 권한 확인 헬퍼 메소드
  private hasWorkspaceAccess(workspace: Workspace, userId: string): boolean {
    // 소유자는 항상 접근 가능
    if (workspace.owner.toString() === userId) {
      return true;
    }

    // 멤버는 접근 가능
    const isMember = workspace.members.some((member) => member.toString() === userId);
    if (isMember) {
      return true;
    }

    // 공개 워크스페이스는 모든 사용자가 접근 가능
    if (workspace.visibility === 'public') {
      return true;
    }

    return false;
  }
}
