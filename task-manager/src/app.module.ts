import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ProjectsModule } from './projects/projects.module';
import { BoardsModule } from './boards/boards.module';
import { ListsModule } from './lists/lists.module';
import { TasksModule } from './tasks/tasks.module';
import { LabelsModule } from './labels/labels.module';
import { CommentsModule } from './comments/comments.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { UserProjectRolesModule } from './user-project-roles/user-project-roles.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    WorkspacesModule,
    ProjectsModule,
    BoardsModule,
    ListsModule,
    TasksModule,
    LabelsModule,
    CommentsModule,
    AttachmentsModule,
    NotificationsModule,
    ActivityLogsModule,
    UserProjectRolesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
