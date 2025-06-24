import { Injectable } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { ProjectsService } from '../projects/projects.service';
import { UsersService } from '../users/users.service';
import { CommentsService } from '../comments/comments.service';

export interface SearchResult {
  tasks: any[];
  projects: any[];
  users: any[];
  comments: any[];
}

@Injectable()
export class SearchService {
  constructor(
    private tasksService: TasksService,
    private projectsService: ProjectsService,
    private usersService: UsersService,
    private commentsService: CommentsService,
  ) {}

  async globalSearch(query: string, userId?: string): Promise<SearchResult> {
    const [tasks, projects, users, comments] = await Promise.all([
      this.tasksService.searchTasks(query, userId),
      this.projectsService.searchProjects(query, userId),
      this.usersService.searchUsers(query),
      this.commentsService.searchComments(query),
    ]);

    return {
      tasks,
      projects,
      users,
      comments,
    };
  }

  async searchByType(
    query: string,
    type: 'tasks' | 'projects' | 'users' | 'comments',
    userId?: string,
  ): Promise<any[]> {
    switch (type) {
      case 'tasks':
        return this.tasksService.searchTasks(query, userId);
      case 'projects':
        return this.projectsService.searchProjects(query, userId);
      case 'users':
        return this.usersService.searchUsers(query);
      case 'comments':
        return this.commentsService.searchComments(query);
      default:
        return [];
    }
  }
}
