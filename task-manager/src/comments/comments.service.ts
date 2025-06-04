import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const createdComment = new this.commentModel(createCommentDto);
    return createdComment.save();
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

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentModel.findById(id).populate('taskId userId parentCommentId').exec();

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
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
}
