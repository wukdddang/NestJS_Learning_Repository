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
  findAll(@Query('listId') listId?: string, @Query('assigneeId') assigneeId?: string) {
    if (listId) {
      return this.tasksService.findByList(listId);
    }
    if (assigneeId) {
      return this.tasksService.findByAssignee(assigneeId);
    }
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.tasksService.updateStatus(id, status);
  }

  @Post(':id/assign')
  assignUser(@Param('id') id: string, @Body('userId') userId: string) {
    return this.tasksService.assignUser(id, userId);
  }

  @Delete(':id/assign/:userId')
  unassignUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.tasksService.unassignUser(id, userId);
  }

  @Put('reorder')
  reorderTasks(@Body('listId') listId: string, @Body('taskIds') taskIds: string[]) {
    return this.tasksService.reorderTasks(listId, taskIds);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
