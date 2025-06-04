import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  // 워크스페이스 생성
  @Post()
  // @UseGuards(JwtAuthGuard) // 인증 구현 후 활성화
  create(@Body() createWorkspaceDto: CreateWorkspaceDto, @Request() req: any) {
    // 임시로 하드코딩된 사용자 ID 사용 (인증 구현 후 req.user.id로 변경)
    const userId = '507f1f77bcf86cd799439011'; // 임시 ObjectId
    return this.workspacesService.create(createWorkspaceDto, userId);
  }

  // 사용자의 워크스페이스 목록 조회
  @Get()
  // @UseGuards(JwtAuthGuard) // 인증 구현 후 활성화
  findAll(@Request() req: any) {
    // 임시로 하드코딩된 사용자 ID 사용
    const userId = '507f1f77bcf86cd799439011';
    return this.workspacesService.findByUser(userId);
  }

  // 워크스페이스 상세 조회
  @Get(':id')
  // @UseGuards(JwtAuthGuard) // 인증 구현 후 활성화
  findOne(@Param('id') id: string, @Request() req: any) {
    const userId = '507f1f77bcf86cd799439011';
    return this.workspacesService.findOne(id, userId);
  }

  // 워크스페이스 업데이트
  @Patch(':id')
  // @UseGuards(JwtAuthGuard) // 인증 구현 후 활성화
  update(@Param('id') id: string, @Body() updateWorkspaceDto: UpdateWorkspaceDto, @Request() req: any) {
    const userId = '507f1f77bcf86cd799439011';
    return this.workspacesService.update(id, updateWorkspaceDto, userId);
  }

  // 워크스페이스 삭제
  @Delete(':id')
  // @UseGuards(JwtAuthGuard) // 인증 구현 후 활성화
  remove(@Param('id') id: string, @Request() req: any) {
    const userId = '507f1f77bcf86cd799439011';
    return this.workspacesService.remove(id, userId);
  }

  // 멤버 추가
  @Post(':id/members')
  // @UseGuards(JwtAuthGuard) // 인증 구현 후 활성화
  addMember(@Param('id') workspaceId: string, @Body('memberId') memberId: string, @Request() req: any) {
    const userId = '507f1f77bcf86cd799439011';
    return this.workspacesService.addMember(workspaceId, userId, memberId);
  }

  // 멤버 제거
  @Delete(':id/members/:memberId')
  // @UseGuards(JwtAuthGuard) // 인증 구현 후 활성화
  removeMember(@Param('id') workspaceId: string, @Param('memberId') memberId: string, @Request() req: any) {
    const userId = '507f1f77bcf86cd799439011';
    return this.workspacesService.removeMember(workspaceId, userId, memberId);
  }
}
