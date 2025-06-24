import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotificationEventHelper } from '../notifications/utils/notification-event.helper';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private readonly notificationEventHelper: NotificationEventHelper,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    projectId?: string,
    taskTitle?: string,
    taskCreatorId?: string,
  ): Promise<Comment> {
    const createdComment = new this.commentModel(createCommentDto);
    const savedComment = await createdComment.save();

    // 댓글 생성 시 이벤트 발행
    if (projectId && taskTitle && taskCreatorId) {
      // 댓글 작성자와 작업 생성자가 다른 경우에만 알림
      if (taskCreatorId !== createCommentDto.userId.toString()) {
        this.notificationEventHelper.emitCommentAdded(
          taskCreatorId,
          createCommentDto.taskId.toString(),
          taskTitle,
          createCommentDto.userId.toString(),
          '댓글 작성자', // 실제로는 User 정보를 조회해야 함
          'creator@example.com', // 실제로는 User 정보를 조회해야 함
        );
      }
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

  // 댓글 검색
  async searchComments(query: string): Promise<Comment[]> {
    return this.commentModel
      .find({
        isActive: true,
        text: { $regex: query, $options: 'i' },
      })
      .populate('taskId userId')
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();
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
