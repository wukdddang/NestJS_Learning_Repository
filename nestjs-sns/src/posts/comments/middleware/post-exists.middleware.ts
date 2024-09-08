import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';
import { PostsService } from '../../posts.service';

@Injectable()
export class PostExistsMiddleware implements NestMiddleware {
  constructor(private readonly postsService: PostsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const postId = req.params.postId;

    if (!postId) {
      throw new BadRequestException('Post ID 파라미터는 필수입니다.');
    }

    const exists = await this.postsService.checkPostExistsById(
      parseInt(postId),
    );

    if (!exists) {
      throw new BadRequestException('해당 ID의 포스트가 존재하지 않습니다.');
    }

    next();
  }
}
