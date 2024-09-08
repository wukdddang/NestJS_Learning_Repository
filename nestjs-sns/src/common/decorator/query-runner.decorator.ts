import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostsModel } from '../../posts/entity/posts.entity';

export const QueryRunner = createParamDecorator(
  (data: keyof PostsModel, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if (!req.queryRunner) {
      throw new InternalServerErrorException(
        `QueryRunner Decorator를 사용하려면 TransactionInterceptor를 사용해야 합니다. Request에 queryRunner가 존재하지 않습니다!`,
      );
    }

    return req.queryRunner;
  },
);
