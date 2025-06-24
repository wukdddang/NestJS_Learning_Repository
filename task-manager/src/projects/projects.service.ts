import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { NotificationEventHelper } from '../notifications/utils/notification-event.helper';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly notificationEventHelper: NotificationEventHelper,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    // leadUserId가 유효한 사용자인지 확인
    const leadUser = await this.userModel.findById(createProjectDto.leadUserId).exec();
    if (!leadUser || !leadUser.isActive) {
      throw new BadRequestException(`Lead user with ID ${createProjectDto.leadUserId} not found or inactive`);
    }

    // DTO에서 받은 leadUserId를 사용 (클라이언트에서 선택)
    const projectData = {
      ...createProjectDto,
      leadUserId: new Types.ObjectId(createProjectDto.leadUserId),
    };
    const createdProject = new this.projectModel(projectData);
    return createdProject.save();
  }

  async findAll(): Promise<Project[]> {
    const projects = await this.projectModel.find({ isActive: true }).populate('workspaceId leadUserId').exec();

    return projects;
  }

  async findByUser(userId: string): Promise<Project[]> {
    console.log('Finding projects for user:', userId);
    const projects = await this.projectModel
      .find({
        $or: [
          { leadUserId: new Types.ObjectId(userId) },
          // 추후 멤버 관계가 구현되면 멤버로 참여한 프로젝트도 포함
        ],
        isActive: true,
      })
      .populate('workspaceId leadUserId')
      .exec();

    return projects;
  }

  async findByWorkspace(workspaceId: string, userId: string): Promise<Project[]> {
    // 워크스페이스 접근 권한 확인 (추후 구현)
    return this.projectModel
      .find({ workspaceId: new Types.ObjectId(workspaceId), isActive: true })
      .populate('workspaceId leadUserId')
      .exec();
  }

  async findOne(id: string, userId?: string): Promise<Project> {
    const project = await this.projectModel.findById(id).populate('workspaceId leadUserId').exec();

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // 권한 확인 (프로젝트 리더 또는 멤버만 접근 가능)
    if (userId && !this.hasProjectAccess(project, userId)) {
      throw new ForbiddenException('Access denied to this project');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<Project> {
    const existingProject = await this.findOne(id);

    // 프로젝트 리더만 수정 가능
    if (existingProject.leadUserId.toString() !== userId) {
      throw new ForbiddenException('Only project lead can update the project');
    }

    const project = await this.projectModel
      .findByIdAndUpdate(id, updateProjectDto, { new: true })
      .populate('workspaceId leadUserId')
      .exec();

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async remove(id: string, userId: string): Promise<Project> {
    const existingProject = await this.findOne(id);

    // 프로젝트 리더만 삭제 가능
    if (existingProject.leadUserId.toString() !== userId) {
      throw new ForbiddenException('Only project lead can delete the project');
    }

    const project = await this.projectModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  // 멤버 관리 (추후 UserProjectRole과 연동)
  async addMember(projectId: string, userId: string, memberId: string): Promise<any> {
    const project = await this.findOne(projectId);

    // 프로젝트 리더만 멤버 추가 가능
    if (project.leadUserId.toString() !== userId) {
      throw new ForbiddenException('Only project lead can add members');
    }

    // 프로젝트 초대 이벤트 발행
    if (memberId !== userId) {
      this.notificationEventHelper.emitProjectInvite(
        memberId,
        projectId,
        project.name,
        userId,
        '프로젝트 리더', // 실제로는 User 정보를 조회해야 함
        'member@example.com', // 실제로는 User 정보를 조회해야 함
      );
    }

    // 추후 UserProjectRole 테이블에 멤버 추가 로직 구현
    return { message: 'Member added successfully', projectId, memberId };
  }

  async removeMember(projectId: string, userId: string, memberId: string): Promise<any> {
    const project = await this.findOne(projectId);

    // 프로젝트 리더만 멤버 제거 가능
    if (project.leadUserId.toString() !== userId) {
      throw new ForbiddenException('Only project lead can remove members');
    }

    // 추후 UserProjectRole 테이블에서 멤버 제거 로직 구현
    return { message: 'Member removed successfully', projectId, memberId };
  }

  async getMembers(projectId: string, userId: string): Promise<any[]> {
    const project = await this.findOne(projectId, userId);

    // 추후 UserProjectRole을 통해 실제 멤버 목록 반환
    return [
      {
        userId: project.leadUserId,
        role: 'lead',
        user: project.leadUserId, // populate로 확장 가능
      },
    ];
  }

  async getProjectStats(projectId: string, userId: string): Promise<any> {
    const project = await this.findOne(projectId, userId);

    // 추후 실제 통계 계산 로직 구현
    return {
      projectId,
      name: project.name,
      totalBoards: 0,
      totalLists: 0,
      totalTasks: 0,
      completedTasks: 0,
      activeMembers: 1,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  // 프로젝트 검색
  async searchProjects(query: string, userId?: string): Promise<Project[]> {
    const searchCriteria: any = {
      isActive: true,
      $or: [{ name: { $regex: query, $options: 'i' } }, { description: { $regex: query, $options: 'i' } }],
    };

    // 사용자별 프로젝트 필터링 (선택적)
    if (userId) {
      searchCriteria.$and = [
        {
          $or: [
            { leadUserId: new Types.ObjectId(userId) },
            // 추후 멤버 관계가 구현되면 멤버로 참여한 프로젝트도 포함
          ],
        },
      ];
    }

    return this.projectModel.find(searchCriteria).populate('workspaceId leadUserId').sort({ name: 1 }).limit(20).exec();
  }

  // 프로젝트 접근 권한 확인 헬퍼 메소드
  private hasProjectAccess(project: Project, userId: string): boolean {
    // 프로젝트 리더는 항상 접근 가능
    if (project.leadUserId.toString() === userId) {
      return true;
    }

    // 추후 UserProjectRole을 통한 멤버 권한 확인 로직 추가
    return true; // 임시로 모든 사용자 접근 허용
  }
}
