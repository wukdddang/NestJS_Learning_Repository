import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { TasksModule } from 'src/tasks/tasks.module';
import { ProjectsModule } from 'src/projects/projects.module';
import { UsersModule } from 'src/users/users.module';
import { CommentsModule } from 'src/comments/comments.module';

@Module({
  imports: [TasksModule, ProjectsModule, UsersModule, CommentsModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
