import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService, SearchResult } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async globalSearch(@Query('q') query: string, @CurrentUser('id') userId: string): Promise<SearchResult> {
    return this.searchService.globalSearch(query, userId);
  }

  @Get('by-type')
  async searchByType(
    @Query('q') query: string,
    @Query('type') type: 'tasks' | 'projects' | 'users' | 'comments',
    @CurrentUser('id') userId: string,
  ): Promise<any[]> {
    return this.searchService.searchByType(query, type, userId);
  }
}
