import { Controller, Get, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string, @Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 50;
    return this.notificationsService.findByUser(userId, limitNumber);
  }

  @Get('user/:userId/unread')
  findUnreadByUser(@Param('userId') userId: string) {
    return this.notificationsService.findUnreadByUser(userId);
  }

  @Get('user/:userId/unread-count')
  getUnreadCount(@Param('userId') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('user/:userId/read-all')
  markAllAsRead(@Param('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }
}
