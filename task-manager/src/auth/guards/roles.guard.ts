import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserProjectRole, UserProjectRoleDocument } from '../../user-project-roles/schemas/user-project-role.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(UserProjectRole.name) private userProjectRoleModel: Model<UserProjectRoleDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const projectId = request.params.projectId || request.body.projectId;

    if (!user || !projectId) {
      return false;
    }

    // 프로젝트에서의 사용자 역할 확인
    const userRole = await this.userProjectRoleModel.findOne({
      userId: user.id,
      projectId: projectId,
      isActive: true,
    });

    if (!userRole) {
      throw new ForbiddenException('해당 프로젝트에 접근 권한이 없습니다.');
    }

    const hasRole = requiredRoles.includes(userRole.role);
    if (!hasRole) {
      throw new ForbiddenException('해당 작업을 수행할 권한이 없습니다.');
    }

    return true;
  }
}
