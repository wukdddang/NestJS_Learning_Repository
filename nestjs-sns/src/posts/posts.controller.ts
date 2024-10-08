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
  // UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
// import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { User } from '../users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { UsersModel } from '../users/entity/users.entity';
import { ImageModelType } from '../common/entity/image.entity';
import { DataSource, QueryRunner as QR } from 'typeorm';
import { PostsImagesService } from './image/images.service';
// import { LogInterceptor } from '../common/interceptor/log.interceptor';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { Roles } from '../users/decorator/roles.decorator';
import { RolesEnum } from '../users/const/roles.const';
import { IsPublic } from '../common/decorator/is-public.decorator';
import { IsPostMineOrAdminGuard } from './guard/is-post-mine-or-admin.guard';
// import { IsOwner } from '../common/decorator/is-owner.decorator';
// import { IsOwnerGuard } from '../common/guard/is-owner.guard';
// import { HttpExceptionFilter } from '../common/exception-filter/http.exception-filter';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { UsersModel } from '../users/entities/users.entity';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsImageService: PostsImagesService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  // @UseInterceptors(ClassSerializerInterceptor)
  // @UseInterceptors(LogInterceptor)
  // @UseFilters(HttpExceptionFilter)
  @IsPublic()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  @Post('random')
  async postPostsRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);
    return true;
  }

  @Get(':id')
  @IsPublic()
  getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  // DTO - Data Transfer Object

  // A Model, B Model
  // Post API -> A 모델을 저장하고 B 모델을 저장한다.
  // await repository.save(A);
  // await repository.save(B);

  // 만약에 a를 저장하다가 실패하면 b를 저장하면 안되는 경우
  // 이런 경우를 막기 위한것이 transaction
  // all or nothing

  // start -> 시작
  // 성공적으로 끝나면 commit -> 저장
  // 실패하면 rollback -> 원상복구

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async postPosts(
    @User('id') userId: number,
    @Body() body: CreatePostDto,
    @QueryRunner() qr: QR,
    // @Body('title') title: string,
    // @Body('content') content: string,
  ) {
    // 로직 실행
    const post = await this.postsService.createPost(userId, body, qr);

    for (let i = 0; i < body.images.length; i++) {
      await this.postsImageService.createPostImage(
        {
          post,
          order: i,
          path: body.images[i],
          type: ImageModelType.POST_IMAGE,
        },
        qr,
      );
    }

    return this.postsService.getPostById(post.id, qr);
  }

  @Patch(':postId')
  @UseGuards(IsPostMineOrAdminGuard)
  patchPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() body: UpdatePostDto,
  ) {
    return this.postsService.updatePost(postId, body);
  }

  @Delete(':postId')
  @UseGuards(IsPostMineOrAdminGuard)
  // @Roles(RolesEnum.ADMIN)
  deletePost(@Param('postId', ParseIntPipe) postId: number) {
    return this.postsService.deletePost(postId);
  }

  // RBAC -> Role Based Access Control
}
