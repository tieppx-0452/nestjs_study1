import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Public } from '../auth/public.decorator';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  findAll(@Query() query: ListArticlesQueryDto, @Request() req) {
    return this.articlesService.findAll(query, req.user?.userId);
  }

  @Get('feed')
  getFeed(@Query() query: ListArticlesQueryDto, @Request() req) {
    return this.articlesService.getFeed(req.user.userId, query.limit, query.offset);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug')
  getArticle(@Param('slug') slug: string, @Request() req) {
    return this.articlesService.getArticle(slug, req.user?.userId);
  }

  @Post()
  create(@Body() dto: CreateArticleDto, @Request() req) {
    return this.articlesService.create(req.user.userId, dto.article);
  }

  @Put(':slug')
  update(@Param('slug') slug: string, @Body() dto: UpdateArticleDto, @Request() req) {
    return this.articlesService.update(slug, req.user.userId, dto.article);
  }

  @HttpCode(200)
  @Delete(':slug')
  remove(@Param('slug') slug: string, @Request() req) {
    return this.articlesService.remove(slug, req.user.userId);
  }

  @Post(':slug/favorite')
  favorite(@Param('slug') slug: string, @Request() req) {
    return this.articlesService.favorite(slug, req.user.userId);
  }

  @Delete(':slug/favorite')
  unfavorite(@Param('slug') slug: string, @Request() req) {
    return this.articlesService.unfavorite(slug, req.user.userId);
  }

  @Post(':slug/comments')
  addComment(@Param('slug') slug: string, @Body() dto: CreateCommentDto, @Request() req) {
    return this.articlesService.addComment(slug, req.user.userId, dto.comment.body);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug/comments')
  getComments(@Param('slug') slug: string, @Request() req) {
    return this.articlesService.getComments(slug, req.user?.userId);
  }

  @Delete(':slug/comments/:id')
  removeComment(
    @Param('slug') slug: string,
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.articlesService.removeComment(slug, id, req.user.userId);
  }
}
