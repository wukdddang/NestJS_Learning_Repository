import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { CommentsModel } from './entity/comments.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from '../../common/common.service';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { UpdateCommentsDto } from './dto/update-comments.dto';
import { DEFAULT_COMMENT_FIND_OPTIONS } from './const/default-comment-find-options.const';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<CommentsModel>(CommentsModel)
      : this.commentsRepository;
  }

  async paginateComments(dto: PaginateCommentsDto, postId: number) {
    return await this.commonService.paginate(
      dto,
      this.commentsRepository,
      {
        ...DEFAULT_COMMENT_FIND_OPTIONS,
        where: {
          post: {
            id: postId,
          },
        },
      },
      'comments',
    );
  }

  async getCommentById(id: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    const comment = await repository.findOne({
      ...DEFAULT_COMMENT_FIND_OPTIONS,
      where: {
        id,
      },
    });

    if (!comment) {
      throw new BadRequestException(`id: ${id} 댓글을 찾을 수 없습니다.`);
    }

    return comment;
  }

  async createComment(
    authorId: number,
    postId: number,
    commentDto: CreateCommentsDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const comment = repository.create({
      author: {
        id: authorId,
      },
      post: {
        id: postId,
      },
      ...commentDto,
      likeCount: 0,
    });

    return await repository.save(comment);
  }

  async updateComment(commentId: number, commentDto: UpdateCommentsDto) {
    const comment = await this.commentsRepository.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new BadRequestException('해당 댓글을 찾을 수 없습니다.');
    }

    const prevComment = await this.commentsRepository.preload({
      id: commentId,
      ...commentDto,
    });

    return await this.commentsRepository.save(prevComment);
  }

  async deleteComment(commentId: number) {
    const comment = await this.commentsRepository.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new BadRequestException('해당 댓글을 찾을 수 없습니다.');
    }

    await this.commentsRepository.delete(commentId);

    return commentId;
  }

  async isCommentMine(userId: number, commentId: number) {
    return this.commentsRepository.exists({
      relations: {
        author: true,
      },
      where: {
        id: commentId,
        author: {
          id: userId,
        },
      },
    });
  }
}
