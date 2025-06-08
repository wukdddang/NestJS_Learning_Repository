import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @Request() req: any) {
    const userId = req.user.id;
    return this.projectsService.create(createProjectDto, userId);
  }

  @Get()
  findAll(@Query('workspaceId') workspaceId?: string, @Request() req?: any) {
    if (workspaceId && req) {
      const userId = req.user.id;
      return this.projectsService.findByWorkspace(workspaceId, userId);
    }
    return this.projectsService.findAll();
  }

  @Get('my-projects')
  findMyProjects(@Request() req: any) {
    const userId = req.user.id;
    return this.projectsService.findByUser(userId);
  }

  @Get('workspace/:workspaceId')
  findByWorkspace(@Param('workspaceId') workspaceId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.projectsService.findByWorkspace(workspaceId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.projectsService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Request() req: any) {
    const userId = req.user.id;
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.projectsService.remove(id, userId);
  }

  @Post(':id/members')
  addMember(@Param('id') projectId: string, @Body('memberId') memberId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.projectsService.addMember(projectId, userId, memberId);
  }

  @Delete(':id/members/:memberId')
  removeMember(@Param('id') projectId: string, @Param('memberId') memberId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.projectsService.removeMember(projectId, userId, memberId);
  }

  @Get(':id/members')
  getMembers(@Param('id') projectId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.projectsService.getMembers(projectId, userId);
  }

  @Get(':id/stats')
  getProjectStats(@Param('id') projectId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.projectsService.getProjectStats(projectId, userId);
  }
}
