import { Controller, Get, Query } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('tasks')
  getTasksByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('userId') userId?: string,
  ) {
    return this.tasksService.findTasksByDateRange(new Date(startDate), new Date(endDate), userId);
  }

  @Get('tasks/today')
  getTasksDueToday(@Query('userId') userId?: string) {
    return this.tasksService.findTasksDueToday(userId);
  }

  @Get('tasks/upcoming')
  getUpcomingTasks(@Query('userId') userId?: string) {
    return this.tasksService.findUpcomingTasks(userId);
  }

  @Get('tasks/month')
  getTasksForMonth(@Query('year') year: string, @Query('month') month: string, @Query('userId') userId?: string) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    return this.tasksService.findTasksByDateRange(startDate, endDate, userId);
  }

  @Get('tasks/week')
  getTasksForWeek(@Query('date') date: string, @Query('userId') userId?: string) {
    const targetDate = new Date(date);
    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(targetDate.getDate() - targetDate.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return this.tasksService.findTasksByDateRange(startOfWeek, endOfWeek, userId);
  }
}
