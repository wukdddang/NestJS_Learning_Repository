import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { QueryRunner as QR } from 'typeorm';
import { CommentsService } from './comments.service';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { AccessTokenGuard } from '../../auth/guard/bearer-token.guard';
import { User } from '../../users/decorator/user.decorator';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { UpdateCommentsDto } from './dto/update-comments.dto';
import { IsPublic } from '../../common/decorator/is-public.decorator';
import { IsCommentMineOrAdminGuard } from './guard/is-comment-mine-or-admin.guard';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {
    /**
     * 1) Entity 생성
     *   author -> 작성자
     *   post -> 귀속되는 포스트
     *   comment -> 실제 댓글 내용
     *   likeCount -> 좋아요 갯수
     *
     *   id -> PrimaryGeneratedColumn
     *   createdAt -> 생성 일자
     *   updatedAt -> 업데이트 일자
     *
     * 2) GET() pagination
     * 3) GET(':commentId') 특정 comment만 하나 가져오는 기능
     * 4) POST() 코멘트 생성하는 기능
     * 5) PATCH(":commentId") 특정 코멘트 수정하는 기능
     * 6) DELETE (":commentId") 특정 코멘트 삭제하는 기능
     */
  }

  @Get()
  @IsPublic()
  async getComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: PaginateCommentsDto,
  ) {
    return this.commentsService.paginateComments(query, postId);
  }

  @Get(':commentId')
  @IsPublic()
  async getCommentById(@Param('commentId', ParseIntPipe) id: number) {
    return this.commentsService.getCommentById(id);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async postComment(
    @User('id') userId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() body: CreateCommentsDto,
    @QueryRunner() qr: QR,
  ) {
    const comment = await this.commentsService.createComment(
      userId,
      postId,
      body,
      qr,
    );

    return this.commentsService.getCommentById(comment.id, qr);
  }

  @Patch(':commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  async patchComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: UpdateCommentsDto,
  ) {
    return await this.commentsService.updateComment(commentId, body);
  }

  @Delete(':commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  async deleteComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return await this.commentsService.deleteComment(commentId);
  }
}
