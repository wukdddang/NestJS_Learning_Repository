import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  TaskAssignedEvent,
  TaskDueEvent,
  CommentAddedEvent,
  ProjectInviteEvent,
  TaskCompletedEvent,
} from '../events/notification.events';

@Injectable()
export class NotificationEventHelper {
  constructor(private eventEmitter: EventEmitter2) {}

  /**
   * 작업 할당 이벤트 발행
   */
  emitTaskAssigned(
    assigneeId: string,
    taskId: string,
    taskTitle: string,
    assignedBy: string,
    assignerName: string,
    assigneeEmail: string,
  ): void {
    const event = new TaskAssignedEvent(assigneeId, taskId, taskTitle, assignedBy, assignerName, assigneeEmail);
    this.eventEmitter.emit('task.assigned', event);
  }

  /**
   * 작업 마감일 이벤트 발행
   */
  emitTaskDue(userId: string, taskId: string, taskTitle: string, dueDate: Date, userEmail: string): void {
    const event = new TaskDueEvent(userId, taskId, taskTitle, dueDate, userEmail);
    this.eventEmitter.emit('task.due', event);
  }

  /**
   * 댓글 추가 이벤트 발행
   */
  emitCommentAdded(
    taskCreatorId: string,
    taskId: string,
    taskTitle: string,
    commentAuthor: string,
    commentAuthorName: string,
    taskCreatorEmail: string,
  ): void {
    const event = new CommentAddedEvent(
      taskCreatorId,
      taskId,
      taskTitle,
      commentAuthor,
      commentAuthorName,
      taskCreatorEmail,
    );
    this.eventEmitter.emit('comment.added', event);
  }

  /**
   * 프로젝트 초대 이벤트 발행
   */
  emitProjectInvite(
    userId: string,
    projectId: string,
    projectName: string,
    invitedBy: string,
    inviterName: string,
    userEmail: string,
  ): void {
    const event = new ProjectInviteEvent(userId, projectId, projectName, invitedBy, inviterName, userEmail);
    this.eventEmitter.emit('project.invite', event);
  }

  /**
   * 작업 완료 이벤트 발행
   */
  emitTaskCompleted(
    taskCreatorId: string,
    taskId: string,
    taskTitle: string,
    completedBy: string,
    completerName: string,
    taskCreatorEmail: string,
  ): void {
    const event = new TaskCompletedEvent(
      taskCreatorId,
      taskId,
      taskTitle,
      completedBy,
      completerName,
      taskCreatorEmail,
    );
    this.eventEmitter.emit('task.completed', event);
  }
}
