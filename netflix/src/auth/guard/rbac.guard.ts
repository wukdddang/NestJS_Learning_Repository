import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RBAC } from '../decorator/rbac.decorator';
import { ROLE } from 'src/user/entities/user.entity';

@Injectable()
export class RBACGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<ROLE>(RBAC, context.getHandler());

    // 만약, RBAC 데코레이터가 없으면 모든 로직을 통과한다.
    if (!Object.values(ROLE).includes(requiredRole)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    return user.role <= requiredRole;
  }
}
