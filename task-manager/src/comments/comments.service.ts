import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

  async create(createCommentDto: CreateCommentDto, projectId?: string, taskTitle?: string): Promise<Comment> {
    const createdComment = new this.commentModel(createCommentDto);
    const savedComment = await createdComment.save();

    // 댓글 생성 시 활동 로그 및 알림 생성
    if (projectId && taskTitle) {
      // ActivityLogsService와 NotificationsService 주입이 필요합니다
      // 여기서는 기본 구조만 남겨둡니다
      // 활동 로그 생성
      // await this.activityLogsService.createCommentAddedLog(
      //   projectId,
      //   createCommentDto.taskId.toString(),
      //   createCommentDto.userId.toString(),
      //   taskTitle
      // );
      // 작업 생성자에게 알림 (댓글 작성자가 아닌 경우)
      // const task = await this.tasksService.findOne(createCommentDto.taskId.toString());
      // if (task.creatorId.toString() !== createCommentDto.userId.toString()) {
      //   await this.notificationsService.createCommentAddedNotification(
      //     task.creatorId.toString(),
      //     createCommentDto.taskId.toString(),
      //     createCommentDto.userId.toString()
      //   );
      // }
    }

    return savedComment;
  }

  async findAll(): Promise<Comment[]> {
    return this.commentModel
      .find({ isActive: true })
      .populate('taskId userId parentCommentId')
      .sort({ createdAt: 1 })
      .exec();
  }

  async findByTask(taskId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ taskId: new Types.ObjectId(taskId), isActive: true })
      .populate('userId parentCommentId')
      .sort({ createdAt: 1 })
      .exec();
  }

  async findReplies(parentCommentId: string): Promise<Comment[]> {
    return this.commentModel
      .find({
        parentCommentId: new Types.ObjectId(parentCommentId),
        isActive: true,
      })
      .populate('userId')
      .sort({ createdAt: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentModel.findById(id).populate('taskId userId parentCommentId').exec();

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async getCommentWithReplies(id: string): Promise<Comment & { replies: Comment[] }> {
    const comment = await this.findOne(id);
    const replies = await this.findReplies(id);

    return {
      ...(comment as any).toObject(),
      replies,
    };
  }

  async update(id: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.commentModel
      .findByIdAndUpdate(id, { ...updateCommentDto, isEdited: true }, { new: true })
      .populate('taskId userId parentCommentId')
      .exec();

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async remove(id: string): Promise<Comment> {
    const comment = await this.commentModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  // 댓글 통계
  async getCommentStats(taskId: string): Promise<{
    totalComments: number;
    activeComments: number;
    recentComments: Comment[];
  }> {
    const totalComments = await this.commentModel.countDocuments({
      taskId: new Types.ObjectId(taskId),
    });

    const activeComments = await this.commentModel.countDocuments({
      taskId: new Types.ObjectId(taskId),
      isActive: true,
    });

    const recentComments = await this.commentModel
      .find({
        taskId: new Types.ObjectId(taskId),
        isActive: true,
      })
      .populate('userId')
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    return {
      totalComments,
      activeComments,
      recentComments,
    };
  }
}
