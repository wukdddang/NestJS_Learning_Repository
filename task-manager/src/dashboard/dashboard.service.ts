import { Injectable } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ProjectsService } from '../projects/projects.service';
import { ActivityActionType } from '../activity-logs/enums/action-type.enum';

@Injectable()
export class DashboardService {
  constructor(
    private readonly tasksService: TasksService,
    private readonly activityLogsService: ActivityLogsService,
    private readonly notificationsService: NotificationsService,
    private readonly projectsService: ProjectsService,
  ) {}

  async getUserDashboard(userId: string) {
    const [myTasks, tasksDueToday, upcomingTasks, recentActivities, unreadNotifications, unreadCount, userStats] =
      await Promise.all([
        this.tasksService.findByAssignee(userId),
        this.tasksService.findTasksDueToday(userId),
        this.tasksService.findUpcomingTasks(userId),
        this.activityLogsService.getRecentActivities(userId, 10),
        this.notificationsService.findUnreadByUser(userId),
        this.notificationsService.getUnreadCount(userId),
        this.getUserStats(userId),
      ]);

    return {
      myTasks: myTasks.slice(0, 10), // 최근 10개만
      tasksDueToday,
      upcomingTasks: upcomingTasks.slice(0, 5), // 다가오는 5개만
      recentActivities,
      unreadNotifications: unreadNotifications.slice(0, 5), // 최근 5개만
      unreadCount,
      stats: userStats,
    };
  }

  async getProjectDashboard(projectId: string) {
    const [projectActivities, projectStats] = await Promise.all([
      this.activityLogsService.findByProject(projectId, 20),
      this.getProjectStats(projectId),
    ]);

    return {
      recentActivities: projectActivities,
      stats: projectStats,
    };
  }

  async getUserStats(userId: string) {
    const myTasks = await this.tasksService.findByAssignee(userId);

    const totalTasks = myTasks.length;
    const completedTasks = myTasks.filter((task) => task.status === 'done').length;
    const inProgressTasks = myTasks.filter((task) => task.status === 'in-progress').length;
    const todoTasks = myTasks.filter((task) => task.status === 'todo').length;

    const overdueTasks = myTasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done',
    ).length;

    const highPriorityTasks = myTasks.filter((task) => task.priority === 'high' || task.priority === 'urgent').length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      highPriorityTasks,
      completionRate,
    };
  }

  async getProjectStats(projectId: string) {
    // 프로젝트의 모든 작업을 가져오기 위해 프로젝트의 보드와 리스트를 통해 조회해야 합니다.
    // 여기서는 단순화하여 프로젝트 기본 정보만 반환합니다.
    const project = await this.projectsService.findOne(projectId);

    return {
      projectName: project.name,
      description: project.description,
      // 추후 확장 가능
      totalBoards: 0,
      totalLists: 0,
      totalTasks: 0,
      completedTasks: 0,
      activeMembers: 0,
    };
  }

  // 주간/월간 통계
  async getUserWeeklyStats(userId: string) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentActivities = await this.activityLogsService.findByUser(userId, 100);
    const weeklyActivities = recentActivities.filter((activity) => new Date(activity.createdAt) >= weekAgo);

    const taskCreated = weeklyActivities.filter((a) => a.actionType === ActivityActionType.TASK_CREATED).length;
    const taskCompleted = weeklyActivities.filter((a) => a.actionType === ActivityActionType.TASK_COMPLETED).length;
    const commentsAdded = weeklyActivities.filter((a) => a.actionType === ActivityActionType.COMMENT_ADDED).length;

    return {
      weeklyTasksCreated: taskCreated,
      weeklyTasksCompleted: taskCompleted,
      weeklyCommentsAdded: commentsAdded,
      totalWeeklyActivities: weeklyActivities.length,
    };
  }

  // 생산성 지표
  async getProductivityMetrics(userId: string) {
    const [weeklyStats, userStats] = await Promise.all([this.getUserWeeklyStats(userId), this.getUserStats(userId)]);

    const productivityScore = this.calculateProductivityScore(userStats, weeklyStats);

    return {
      ...userStats,
      ...weeklyStats,
      productivityScore,
    };
  }

  private calculateProductivityScore(userStats: any, weeklyStats: any): number {
    // 간단한 생산성 점수 계산 로직
    let score = 0;

    // 완료율 기반 점수 (0-40점)
    score += userStats.completionRate * 0.4;

    // 주간 완료 작업 수 기반 점수 (0-30점)
    score += Math.min(weeklyStats.weeklyTasksCompleted * 5, 30);

    // 활동성 점수 (0-20점)
    score += Math.min(weeklyStats.totalWeeklyActivities * 2, 20);

    // 지연 작업 패널티 (0-10점 감점)
    score -= Math.min(userStats.overdueTasks * 2, 10);

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
