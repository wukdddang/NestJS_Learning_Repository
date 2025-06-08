import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('workspaces')
@UseGuards(JwtAuthGuard) // 전체 컨트롤러에 JWT 인증 적용
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  // 워크스페이스 생성
  @Post()
  create(@Body() createWorkspaceDto: CreateWorkspaceDto, @Request() req: any) {
    const userId = req.user.id; // JWT 토큰에서 사용자 ID 추출
    return this.workspacesService.create(createWorkspaceDto, userId);
  }

  // 모든 워크스페이스 조회 (내가 속한 것)
  @Get()
  findAll(@Request() req: any) {
    const userId = req.user.id; // JWT 토큰에서 사용자 ID 추출
    return this.workspacesService.findByUser(userId);
  }

  // 내가 속한 워크스페이스만 조회
  @Get('my-workspaces')
  findMyWorkspaces(@Request() req: any) {
    const userId = req.user.id; // JWT 토큰에서 사용자 ID 추출
    return this.workspacesService.findByUser(userId);
  }

  // 워크스페이스 상세 조회
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id; // JWT 토큰에서 사용자 ID 추출
    return this.workspacesService.findOne(id, userId);
  }

  // 워크스페이스 업데이트
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkspaceDto: UpdateWorkspaceDto, @Request() req: any) {
    const userId = req.user.id; // JWT 토큰에서 사용자 ID 추출
    return this.workspacesService.update(id, updateWorkspaceDto, userId);
  }

  // 워크스페이스 삭제
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id; // JWT 토큰에서 사용자 ID 추출
    return this.workspacesService.remove(id, userId);
  }

  // 멤버 추가
  @Post(':id/members')
  addMember(@Param('id') workspaceId: string, @Body('memberId') memberId: string, @Request() req: any) {
    const userId = req.user.id; // JWT 토큰에서 사용자 ID 추출
    return this.workspacesService.addMember(workspaceId, userId, memberId);
  }

  // 멤버 제거
  @Delete(':id/members/:memberId')
  removeMember(@Param('id') workspaceId: string, @Param('memberId') memberId: string, @Request() req: any) {
    const userId = req.user.id; // JWT 토큰에서 사용자 ID 추출
    return this.workspacesService.removeMember(workspaceId, userId, memberId);
  }

  @Get(':id/members')
  getMembers(@Param('id') workspaceId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.workspacesService.getMembers(workspaceId, userId);
  }

  // 워크스페이스 통계
  @Get(':id/stats')
  getWorkspaceStats(@Param('id') workspaceId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.workspacesService.getWorkspaceStats(workspaceId, userId);
  }
}
