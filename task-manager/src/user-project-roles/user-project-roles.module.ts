import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProjectRolesController } from './user-project-roles.controller';
import { UserProjectRolesService } from './user-project-roles.service';
import { UserProjectRole, UserProjectRoleSchema } from './schemas/user-project-role.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserProjectRole.name, schema: UserProjectRoleSchema }])],
  controllers: [UserProjectRolesController],
  providers: [UserProjectRolesService],
  exports: [UserProjectRolesService],
})
export class UserProjectRolesModule {}
