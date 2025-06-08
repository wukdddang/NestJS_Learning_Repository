import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActivityLog, ActivityLogDocument } from './schemas/activity-log.schema';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { ActivityActionType } from './enums/action-type.enum';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectModel(ActivityLog.name)
    private activityLogModel: Model<ActivityLogDocument>,
  ) {}

  async create(createActivityLogDto: CreateActivityLogDto): Promise<ActivityLog> {
    const activityLog = new this.activityLogModel(createActivityLogDto);
    return activityLog.save();
  }

  async findByProject(projectId: string, limit: number = 100): Promise<ActivityLog[]> {
    return this.activityLogModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .populate('userId taskId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByTask(taskId: string): Promise<ActivityLog[]> {
    return this.activityLogModel
      .find({ taskId: new Types.ObjectId(taskId) })
      .populate('userId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string, limit: number = 100): Promise<ActivityLog[]> {
    return this.activityLogModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('projectId taskId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  // 작업 생성 로그
  async createTaskCreatedLog(
    projectId: string,
    taskId: string,
    userId: string,
    taskTitle: string,
  ): Promise<ActivityLog> {
    return this.create({
      projectId: new Types.ObjectId(projectId),
      taskId: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
      actionType: ActivityActionType.TASK_CREATED,
      details: `작업 "${taskTitle}"을 생성했습니다.`,
    });
  }

  // 작업 업데이트 로그
  async createTaskUpdatedLog(
    projectId: string,
    taskId: string,
    userId: string,
    field: string,
    previousValue: string,
    newValue: string,
  ): Promise<ActivityLog> {
    return this.create({
      projectId: new Types.ObjectId(projectId),
      taskId: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
      actionType: ActivityActionType.TASK_UPDATED,
      details: `작업의 ${field}을(를) 변경했습니다.`,
      previousValue,
      newValue,
    });
  }

  // 작업 완료 로그
  async createTaskCompletedLog(
    projectId: string,
    taskId: string,
    userId: string,
    taskTitle: string,
  ): Promise<ActivityLog> {
    return this.create({
      projectId: new Types.ObjectId(projectId),
      taskId: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
      actionType: ActivityActionType.TASK_COMPLETED,
      details: `작업 "${taskTitle}"을 완료했습니다.`,
    });
  }

  // 작업 할당 로그
  async createTaskAssignedLog(
    projectId: string,
    taskId: string,
    userId: string,
    assigneeId: string,
    taskTitle: string,
  ): Promise<ActivityLog> {
    return this.create({
      projectId: new Types.ObjectId(projectId),
      taskId: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
      actionType: ActivityActionType.TASK_ASSIGNED,
      details: `작업 "${taskTitle}"을 할당했습니다.`,
      newValue: assigneeId,
    });
  }

  // 작업 이동 로그
  async createTaskMovedLog(
    projectId: string,
    taskId: string,
    userId: string,
    previousListName: string,
    newListName: string,
    taskTitle: string,
  ): Promise<ActivityLog> {
    return this.create({
      projectId: new Types.ObjectId(projectId),
      taskId: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
      actionType: ActivityActionType.TASK_MOVED,
      details: `작업 "${taskTitle}"을 이동했습니다.`,
      previousValue: previousListName,
      newValue: newListName,
    });
  }

  // 댓글 추가 로그
  async createCommentAddedLog(
    projectId: string,
    taskId: string,
    userId: string,
    taskTitle: string,
  ): Promise<ActivityLog> {
    return this.create({
      projectId: new Types.ObjectId(projectId),
      taskId: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
      actionType: ActivityActionType.COMMENT_ADDED,
      details: `작업 "${taskTitle}"에 댓글을 추가했습니다.`,
    });
  }

  // 첨부파일 추가 로그
  async createAttachmentAddedLog(
    projectId: string,
    taskId: string,
    userId: string,
    fileName: string,
    taskTitle: string,
  ): Promise<ActivityLog> {
    return this.create({
      projectId: new Types.ObjectId(projectId),
      taskId: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
      actionType: ActivityActionType.ATTACHMENT_ADDED,
      details: `작업 "${taskTitle}"에 파일 "${fileName}"을 첨부했습니다.`,
    });
  }

  // 프로젝트 업데이트 로그
  async createProjectUpdatedLog(
    projectId: string,
    userId: string,
    field: string,
    previousValue: string,
    newValue: string,
  ): Promise<ActivityLog> {
    return this.create({
      projectId: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(userId),
      actionType: ActivityActionType.PROJECT_UPDATED,
      details: `프로젝트의 ${field}을(를) 변경했습니다.`,
      previousValue,
      newValue,
    });
  }

  // 최근 활동 조회 (대시보드용)
  async getRecentActivities(userId: string, limit: number = 20): Promise<ActivityLog[]> {
    return this.activityLogModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('projectId taskId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
