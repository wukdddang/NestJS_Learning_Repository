import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get('search')
  search(@Query('q') query: string, @Query('userId') userId?: string) {
    return this.tasksService.searchTasks(query, userId);
  }

  @Get('due-today')
  findTasksDueToday(@Query('userId') userId?: string) {
    return this.tasksService.findTasksDueToday(userId);
  }

  @Get('upcoming')
  findUpcomingTasks(@Query('userId') userId?: string) {
    return this.tasksService.findUpcomingTasks(userId);
  }

  @Get('by-date-range')
  findTasksByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('userId') userId?: string,
  ) {
    return this.tasksService.findTasksByDateRange(new Date(startDate), new Date(endDate), userId);
  }

  @Get('list/:listId')
  findByList(@Param('listId') listId: string) {
    return this.tasksService.findByList(listId);
  }

  @Get('assignee/:assigneeId')
  findByAssignee(@Param('assigneeId') assigneeId: string) {
    return this.tasksService.findByAssignee(assigneeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Get(':id/with-subtasks')
  getTaskWithSubtasks(@Param('id') id: string) {
    return this.tasksService.getTaskWithSubtasks(id);
  }

  @Get(':id/subtasks')
  findSubtasks(@Param('id') parentTaskId: string) {
    return this.tasksService.findSubtasks(parentTaskId);
  }

  @Get(':id/progress')
  calculateProgress(@Param('id') id: string) {
    return this.tasksService.calculateTaskProgress(id);
  }

  @Post(':id/subtasks')
  createSubtask(@Param('id') parentTaskId: string, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.createSubtask(parentTaskId, createTaskDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.tasksService.updateStatus(id, status);
  }

  @Patch(':id/assign/:userId')
  assignUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.tasksService.assignUser(id, userId);
  }

  @Patch(':id/unassign/:userId')
  unassignUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.tasksService.unassignUser(id, userId);
  }

  @Post('reorder')
  reorderTasks(@Body('listId') listId: string, @Body('taskIds') taskIds: string[]) {
    return this.tasksService.reorderTasks(listId, taskIds);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
