import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import { ArticlesResponseDto } from './dto/article-response.dto';
import { Public } from '../auth/public.decorator';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  findAll(
    @Query() query: ListArticlesQueryDto,
    @Request() req,
  ): Promise<ArticlesResponseDto> {
    return this.articlesService.findAll(query, req.user?.userId);
  }
}
