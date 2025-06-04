import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { WorkspacesModule } from './workspaces/workspaces.module';

@Module({
  imports: [AppConfigModule, DatabaseModule, UsersModule, AuthModule, WorkspacesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
