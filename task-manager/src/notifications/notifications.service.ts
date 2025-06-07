import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = new this.notificationModel(createNotificationDto);
    return notification.save();
  }

  async findByUser(userId: string, limit: number = 50): Promise<Notification[]> {
    return this.notificationModel
      .find({
        userId: new Types.ObjectId(userId),
        isActive: true,
      })
      .populate('relatedTaskId relatedProjectId triggeredBy')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findUnreadByUser(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({
        userId: new Types.ObjectId(userId),
        isRead: false,
        isActive: true,
      })
      .populate('relatedTaskId relatedProjectId triggeredBy')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
      isActive: true,
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true }).exec();

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      {
        userId: new Types.ObjectId(userId),
        isRead: false,
        isActive: true,
      },
      { isRead: true },
    );
  }

  async delete(id: string): Promise<void> {
    const result = await this.notificationModel.findByIdAndUpdate(id, { isActive: false }).exec();

    if (!result) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
  }

  // 작업 할당 알림
  async createTaskAssignedNotification(assigneeId: string, taskId: string, assignedBy: string): Promise<Notification> {
    return this.create({
      userId: new Types.ObjectId(assigneeId),
      message: '새로운 작업이 할당되었습니다.',
      type: 'task_assigned',
      relatedTaskId: new Types.ObjectId(taskId),
      triggeredBy: new Types.ObjectId(assignedBy),
    });
  }

  // 작업 마감일 알림
  async createTaskDueNotification(userId: string, taskId: string): Promise<Notification> {
    return this.create({
      userId: new Types.ObjectId(userId),
      message: '작업 마감일이 다가왔습니다.',
      type: 'task_due',
      relatedTaskId: new Types.ObjectId(taskId),
    });
  }

  // 댓글 추가 알림
  async createCommentAddedNotification(
    taskCreatorId: string,
    taskId: string,
    commentAuthor: string,
  ): Promise<Notification> {
    return this.create({
      userId: new Types.ObjectId(taskCreatorId),
      message: '작업에 새로운 댓글이 추가되었습니다.',
      type: 'comment_added',
      relatedTaskId: new Types.ObjectId(taskId),
      triggeredBy: new Types.ObjectId(commentAuthor),
    });
  }

  // 프로젝트 초대 알림
  async createProjectInviteNotification(userId: string, projectId: string, invitedBy: string): Promise<Notification> {
    return this.create({
      userId: new Types.ObjectId(userId),
      message: '새로운 프로젝트에 초대되었습니다.',
      type: 'project_invite',
      relatedProjectId: new Types.ObjectId(projectId),
      triggeredBy: new Types.ObjectId(invitedBy),
    });
  }

  // 작업 완료 알림
  async createTaskCompletedNotification(
    taskCreatorId: string,
    taskId: string,
    completedBy: string,
  ): Promise<Notification> {
    return this.create({
      userId: new Types.ObjectId(taskCreatorId),
      message: '작업이 완료되었습니다.',
      type: 'task_completed',
      relatedTaskId: new Types.ObjectId(taskId),
      triggeredBy: new Types.ObjectId(completedBy),
    });
  }
}
