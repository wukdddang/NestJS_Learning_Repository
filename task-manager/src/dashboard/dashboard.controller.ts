import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('user/:userId')
  getUserDashboard(@Param('userId') userId: string) {
    return this.dashboardService.getUserDashboard(userId);
  }

  @Get('project/:projectId')
  getProjectDashboard(@Param('projectId') projectId: string) {
    return this.dashboardService.getProjectDashboard(projectId);
  }

  @Get('user/:userId/stats')
  getUserStats(@Param('userId') userId: string) {
    return this.dashboardService.getUserStats(userId);
  }

  @Get('project/:projectId/stats')
  getProjectStats(@Param('projectId') projectId: string) {
    return this.dashboardService.getProjectStats(projectId);
  }

  @Get('user/:userId/weekly-stats')
  getUserWeeklyStats(@Param('userId') userId: string) {
    return this.dashboardService.getUserWeeklyStats(userId);
  }

  @Get('user/:userId/productivity')
  getProductivityMetrics(@Param('userId') userId: string) {
    return this.dashboardService.getProductivityMetrics(userId);
  }
}
