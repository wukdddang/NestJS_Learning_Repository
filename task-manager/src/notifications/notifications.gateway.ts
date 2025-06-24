import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.id;

      client.data.userId = userId;
      this.connectedUsers.set(userId, client.id);

      // 사용자별 룸에 입장
      client.join(`user:${userId}`);

      this.logger.log(`User ${userId} connected: ${client.id}`);
    } catch (error) {
      this.logger.error('Connection failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(`User ${userId} disconnected: ${client.id}`);
    }
  }

  @SubscribeMessage('joinProject')
  handleJoinProject(@MessageBody() projectId: string, @ConnectedSocket() client: Socket) {
    client.join(`project:${projectId}`);
    this.logger.log(`User ${client.data.userId} joined project ${projectId}`);
  }

  @SubscribeMessage('leaveProject')
  handleLeaveProject(@MessageBody() projectId: string, @ConnectedSocket() client: Socket) {
    client.leave(`project:${projectId}`);
    this.logger.log(`User ${client.data.userId} left project ${projectId}`);
  }

  // 개별 사용자에게 알림 전송
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  // 프로젝트 멤버들에게 알림 전송
  sendNotificationToProject(projectId: string, notification: any) {
    this.server.to(`project:${projectId}`).emit('projectNotification', notification);
  }

  // 작업 할당 알림
  sendTaskAssignedNotification(assigneeId: string, notification: any) {
    this.sendNotificationToUser(assigneeId, {
      type: 'task_assigned',
      ...notification,
    });
  }

  // 댓글 추가 알림
  sendCommentAddedNotification(userId: string, notification: any) {
    this.sendNotificationToUser(userId, {
      type: 'comment_added',
      ...notification,
    });
  }

  // 작업 완료 알림
  sendTaskCompletedNotification(userId: string, notification: any) {
    this.sendNotificationToUser(userId, {
      type: 'task_completed',
      ...notification,
    });
  }
}
