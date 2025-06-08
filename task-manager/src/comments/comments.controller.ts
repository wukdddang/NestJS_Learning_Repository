import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @Body('projectId') projectId?: string,
    @Body('taskTitle') taskTitle?: string,
  ) {
    return this.commentsService.create(createCommentDto, projectId, taskTitle);
  }

  @Get()
  findAll(@Query('taskId') taskId?: string) {
    if (taskId) {
      return this.commentsService.findByTask(taskId);
    }
    return this.commentsService.findAll();
  }

  @Get('task/:taskId')
  findByTask(@Param('taskId') taskId: string) {
    return this.commentsService.findByTask(taskId);
  }

  @Get('task/:taskId/stats')
  getCommentStats(@Param('taskId') taskId: string) {
    return this.commentsService.getCommentStats(taskId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Get(':id/with-replies')
  getCommentWithReplies(@Param('id') id: string) {
    return this.commentsService.getCommentWithReplies(id);
  }

  @Get(':id/replies')
  findReplies(@Param('id') parentCommentId: string) {
    return this.commentsService.findReplies(parentCommentId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }
}
