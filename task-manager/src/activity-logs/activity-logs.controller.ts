import { Controller, Get, Param, Query } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';

@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string, @Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 100;
    return this.activityLogsService.findByProject(projectId, limitNumber);
  }

  @Get('task/:taskId')
  findByTask(@Param('taskId') taskId: string) {
    return this.activityLogsService.findByTask(taskId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string, @Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 100;
    return this.activityLogsService.findByUser(userId, limitNumber);
  }

  @Get('user/:userId/recent')
  getRecentActivities(@Param('userId') userId: string, @Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    return this.activityLogsService.getRecentActivities(userId, limitNumber);
  }
}
