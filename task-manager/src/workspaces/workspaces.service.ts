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
  async create(createWorkspaceDto: CreateWorkspaceDto, ownerId: string): Promise<Workspace> {
    const workspace = new this.workspaceModel({
      ...createWorkspaceDto,
      owner: new Types.ObjectId(ownerId),
      members: [new Types.ObjectId(ownerId)], // 생성자를 멤버로 추가
    });
    return workspace.save();
  }

  // 사용자의 워크스페이스 목록 조회
  async findByUser(userId: string): Promise<Workspace[]> {
    return this.workspaceModel
      .find({
        $or: [{ owner: new Types.ObjectId(userId) }, { members: new Types.ObjectId(userId) }],
        isActive: true,
      })
      .populate('owner', 'username email')
      .populate('members', 'username email')
      .sort({ createdAt: -1 })
      .exec();
  }

  // 워크스페이스 상세 조회
  async findOne(id: string, userId: string): Promise<Workspace> {
    const workspace = await this.workspaceModel
      .findById(id)
      .populate('owner', 'username email')
      .populate('members', 'username email')
      .exec();

    if (!workspace) {
      throw new NotFoundException('워크스페이스를 찾을 수 없습니다.');
    }

    // 접근 권한 확인
    const hasAccess =
      workspace.owner.toString() === userId || workspace.members.some((member) => member.toString() === userId);

    if (!hasAccess) {
      throw new ForbiddenException('워크스페이스에 접근할 권한이 없습니다.');
    }

    return workspace;
  }

  // 워크스페이스 업데이트
  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto, userId: string): Promise<Workspace> {
    const workspace = await this.findOne(id, userId);

    // 소유자만 수정 가능
    if (workspace.owner.toString() !== userId) {
      throw new ForbiddenException('워크스페이스를 수정할 권한이 없습니다.');
    }

    const updatedWorkspace = await this.workspaceModel
      .findByIdAndUpdate(id, updateWorkspaceDto, { new: true })
      .populate('owner', 'username email')
      .populate('members', 'username email')
      .exec();

    if (!updatedWorkspace) {
      throw new NotFoundException('워크스페이스를 찾을 수 없습니다.');
    }

    return updatedWorkspace;
  }

  // 워크스페이스 삭제 (소프트 삭제)
  async remove(id: string, userId: string): Promise<void> {
    const workspace = await this.findOne(id, userId);

    // 소유자만 삭제 가능
    if (workspace.owner.toString() !== userId) {
      throw new ForbiddenException('워크스페이스를 삭제할 권한이 없습니다.');
    }

    await this.workspaceModel.findByIdAndUpdate(id, { isActive: false });
  }

  // 멤버 추가
  async addMember(workspaceId: string, userId: string, memberId: string): Promise<Workspace> {
    const workspace = await this.findOne(workspaceId, userId);

    // 소유자만 멤버 추가 가능
    if (workspace.owner.toString() !== userId) {
      throw new ForbiddenException('멤버를 추가할 권한이 없습니다.');
    }

    // 이미 멤버인지 확인
    const isMember = workspace.members.some((member) => member.toString() === memberId);
    if (isMember) {
      throw new ForbiddenException('이미 워크스페이스 멤버입니다.');
    }

    const updatedWorkspace = await this.workspaceModel
      .findByIdAndUpdate(workspaceId, { $push: { members: new Types.ObjectId(memberId) } }, { new: true })
      .populate('owner', 'username email')
      .populate('members', 'username email')
      .exec();

    if (!updatedWorkspace) {
      throw new NotFoundException('워크스페이스를 찾을 수 없습니다.');
    }

    return updatedWorkspace;
  }

  // 멤버 제거
  async removeMember(workspaceId: string, userId: string, memberId: string): Promise<Workspace> {
    const workspace = await this.findOne(workspaceId, userId);

    // 소유자만 멤버 제거 가능
    if (workspace.owner.toString() !== userId) {
      throw new ForbiddenException('멤버를 제거할 권한이 없습니다.');
    }

    // 소유자는 제거할 수 없음
    if (workspace.owner.toString() === memberId) {
      throw new ForbiddenException('워크스페이스 소유자는 제거할 수 없습니다.');
    }

    const updatedWorkspace = await this.workspaceModel
      .findByIdAndUpdate(workspaceId, { $pull: { members: new Types.ObjectId(memberId) } }, { new: true })
      .populate('owner', 'username email')
      .populate('members', 'username email')
      .exec();

    if (!updatedWorkspace) {
      throw new NotFoundException('워크스페이스를 찾을 수 없습니다.');
    }

    return updatedWorkspace;
  }
}
