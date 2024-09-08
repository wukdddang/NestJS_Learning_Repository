import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersModel } from '../../../users/entity/users.entity';
import { RolesEnum } from '../../../users/const/roles.const';
import { CommentsService } from '../comments.service';

@Injectable()
export class IsCommentMineOrAdminGuard implements CanActivate {
  constructor(private readonly commentsService: CommentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request & {
      user: UsersModel;
    };

    const { user } = req;

    if (!user) {
      throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다.');
    }

    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const commentId = req.params.commentId;

    if (!commentId) {
      throw new BadRequestException(
        'Comment ID가 파라미터로 제공되어야 합니다.',
      );
    }

    const isOk = await this.commentsService.isCommentMine(
      user.id,
      parseInt(commentId),
    );

    if (!isOk) {
      throw new UnauthorizedException('권한이 없습니다.');
    }

    return true;
  }
}
