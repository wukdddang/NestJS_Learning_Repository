import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from './notifications.gateway';
import {
  TaskAssignedEvent,
  TaskDueEvent,
  CommentAddedEvent,
  ProjectInviteEvent,
  TaskCompletedEvent,
} from './events/notification.events';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private emailService: EmailService,
    private notificationsGateway: NotificationsGateway,
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

  // 이벤트 기반 알림 처리
  @OnEvent('task.assigned')
  async handleTaskAssigned(event: TaskAssignedEvent): Promise<void> {
    try {
      // 데이터베이스에 알림 저장
      const notification = await this.create({
        userId: new Types.ObjectId(event.assigneeId),
        message: '새로운 작업이 할당되었습니다.',
        type: 'task_assigned',
        relatedTaskId: new Types.ObjectId(event.taskId),
        triggeredBy: new Types.ObjectId(event.assignedBy),
      });

      // 실시간 알림 전송
      this.notificationsGateway.sendTaskAssignedNotification(event.assigneeId, notification);

      // 이메일 알림 전송
      await this.emailService.sendTaskAssignedEmail(event.assigneeEmail, event.taskTitle, event.assignerName);
    } catch (error) {
      console.error('Failed to handle task assigned event:', error);
    }
  }

  @OnEvent('task.due')
  async handleTaskDue(event: TaskDueEvent): Promise<void> {
    try {
      // 데이터베이스에 알림 저장
      const notification = await this.create({
        userId: new Types.ObjectId(event.userId),
        message: '작업 마감일이 다가왔습니다.',
        type: 'task_due',
        relatedTaskId: new Types.ObjectId(event.taskId),
      });

      // 실시간 알림 전송
      this.notificationsGateway.sendNotificationToUser(event.userId, {
        ...notification,
        type: 'task_due',
      });

      // 이메일 알림 전송
      await this.emailService.sendTaskDueEmail(event.userEmail, event.taskTitle, event.dueDate);
    } catch (error) {
      console.error('Failed to handle task due event:', error);
    }
  }

  @OnEvent('comment.added')
  async handleCommentAdded(event: CommentAddedEvent): Promise<void> {
    try {
      // 데이터베이스에 알림 저장
      const notification = await this.create({
        userId: new Types.ObjectId(event.taskCreatorId),
        message: '작업에 새로운 댓글이 추가되었습니다.',
        type: 'comment_added',
        relatedTaskId: new Types.ObjectId(event.taskId),
        triggeredBy: new Types.ObjectId(event.commentAuthor),
      });

      // 실시간 알림 전송
      this.notificationsGateway.sendCommentAddedNotification(event.taskCreatorId, notification);

      // 이메일 알림 전송
      await this.emailService.sendCommentNotificationEmail(
        event.taskCreatorEmail,
        event.taskTitle,
        event.commentAuthorName,
      );
    } catch (error) {
      console.error('Failed to handle comment added event:', error);
    }
  }

  @OnEvent('project.invite')
  async handleProjectInvite(event: ProjectInviteEvent): Promise<void> {
    try {
      // 데이터베이스에 알림 저장
      const notification = await this.create({
        userId: new Types.ObjectId(event.userId),
        message: '새로운 프로젝트에 초대되었습니다.',
        type: 'project_invite',
        relatedProjectId: new Types.ObjectId(event.projectId),
        triggeredBy: new Types.ObjectId(event.invitedBy),
      });

      // 실시간 알림 전송
      this.notificationsGateway.sendNotificationToUser(event.userId, {
        ...notification,
        type: 'project_invite',
      });

      // 이메일 알림 전송
      await this.emailService.sendProjectInviteEmail(event.userEmail, event.projectName, event.inviterName);
    } catch (error) {
      console.error('Failed to handle project invite event:', error);
    }
  }

  @OnEvent('task.completed')
  async handleTaskCompleted(event: TaskCompletedEvent): Promise<void> {
    try {
      // 데이터베이스에 알림 저장
      const notification = await this.create({
        userId: new Types.ObjectId(event.taskCreatorId),
        message: '작업이 완료되었습니다.',
        type: 'task_completed',
        relatedTaskId: new Types.ObjectId(event.taskId),
        triggeredBy: new Types.ObjectId(event.completedBy),
      });

      // 실시간 알림 전송
      this.notificationsGateway.sendTaskCompletedNotification(event.taskCreatorId, notification);

      // 이메일 알림 (선택적)
      // await this.emailService.sendTaskCompletedEmail(...);
    } catch (error) {
      console.error('Failed to handle task completed event:', error);
    }
  }

  // 기존 메서드들은 더 이상 사용하지 않지만, 호환성을 위해 남겨둡니다
  // (추후 완전히 제거할 수 있습니다)
  async createTaskAssignedNotification(assigneeId: string, taskId: string, assignedBy: string): Promise<Notification> {
    console.warn('createTaskAssignedNotification is deprecated. Use event-based approach instead.');
    return this.create({
      userId: new Types.ObjectId(assigneeId),
      message: '새로운 작업이 할당되었습니다.',
      type: 'task_assigned',
      relatedTaskId: new Types.ObjectId(taskId),
      triggeredBy: new Types.ObjectId(assignedBy),
    });
  }

  async createTaskDueNotification(userId: string, taskId: string): Promise<Notification> {
    console.warn('createTaskDueNotification is deprecated. Use event-based approach instead.');
    return this.create({
      userId: new Types.ObjectId(userId),
      message: '작업 마감일이 다가왔습니다.',
      type: 'task_due',
      relatedTaskId: new Types.ObjectId(taskId),
    });
  }

  async createCommentAddedNotification(
    taskCreatorId: string,
    taskId: string,
    commentAuthor: string,
  ): Promise<Notification> {
    console.warn('createCommentAddedNotification is deprecated. Use event-based approach instead.');
    return this.create({
      userId: new Types.ObjectId(taskCreatorId),
      message: '작업에 새로운 댓글이 추가되었습니다.',
      type: 'comment_added',
      relatedTaskId: new Types.ObjectId(taskId),
      triggeredBy: new Types.ObjectId(commentAuthor),
    });
  }

  async createProjectInviteNotification(userId: string, projectId: string, invitedBy: string): Promise<Notification> {
    console.warn('createProjectInviteNotification is deprecated. Use event-based approach instead.');
    return this.create({
      userId: new Types.ObjectId(userId),
      message: '새로운 프로젝트에 초대되었습니다.',
      type: 'project_invite',
      relatedProjectId: new Types.ObjectId(projectId),
      triggeredBy: new Types.ObjectId(invitedBy),
    });
  }

  async createTaskCompletedNotification(
    taskCreatorId: string,
    taskId: string,
    completedBy: string,
  ): Promise<Notification> {
    console.warn('createTaskCompletedNotification is deprecated. Use event-based approach instead.');
    return this.create({
      userId: new Types.ObjectId(taskCreatorId),
      message: '작업이 완료되었습니다.',
      type: 'task_completed',
      relatedTaskId: new Types.ObjectId(taskId),
      triggeredBy: new Types.ObjectId(completedBy),
    });
  }
}
