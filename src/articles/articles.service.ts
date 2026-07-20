import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { UsersService } from '../users/users.service';
import { ProfileDto } from '../users/dto/profile-response.dto';
import { Article } from './entities/article.entity';
import { Favorite } from './entities/favorite.entity';
import { Comment } from './entities/comment.entity';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import { CreateArticleFieldsDto } from './dto/create-article.dto';
import { UpdateArticleFieldsDto } from './dto/update-article.dto';
import { ArticleDto, ArticleResponseDto, ArticlesResponseDto } from './dto/article-response.dto';
import { CommentDto, CommentResponseDto, CommentsResponseDto } from './dto/comment-response.dto';
import { generateSlug } from './slug.util';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  async findAll(query: ListArticlesQueryDto, viewerId?: number): Promise<ArticlesResponseDto> {
    const { tag, author, favorited, limit, offset } = query;

    const qb = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .orderBy('article.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    if (tag) {
      qb.andWhere(':tag = ANY(article.tagList)', { tag });
    }
    if (author) {
      qb.andWhere('author.username = :author', { author });
    }
    if (favorited) {
      qb.andWhere(
        `article.id IN (
          SELECT favorite."articleId" FROM favorites favorite
          INNER JOIN users favoritedUser ON favoritedUser.id = favorite."userId"
          WHERE favoritedUser.username = :favorited
        )`,
        { favorited },
      );
    }

    const [articles, articlesCount] = await qb.getManyAndCount();
    return this.buildArticlesResponse(articles, articlesCount, viewerId);
  }

  async getFeed(viewerId: number, limit: number, offset: number): Promise<ArticlesResponseDto> {
    const followingIds = await this.usersService.getFollowingIds(viewerId);
    if (!followingIds.length) {
      return new ArticlesResponseDto([], 0);
    }

    const [articles, articlesCount] = await this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .where('article.authorId IN (:...followingIds)', { followingIds })
      .orderBy('article.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return this.buildArticlesResponse(articles, articlesCount, viewerId);
  }

  async getArticle(slug: string, viewerId?: number): Promise<ArticleResponseDto> {
    const article = await this.findOneBySlug(slug);
    return new ArticleResponseDto(await this.toArticleDto(article, viewerId));
  }

  async create(authorId: number, dto: CreateArticleFieldsDto): Promise<ArticleResponseDto> {
    const article = this.articlesRepository.create({
      slug: generateSlug(dto.title),
      title: dto.title,
      description: dto.description,
      body: dto.body,
      tagList: dto.tagList ?? [],
      authorId,
    });

    const saved = await this.articlesRepository.save(article);
    saved.author = (await this.usersService.findOne(authorId))!;

    return new ArticleResponseDto(await this.toArticleDto(saved, authorId));
  }

  async update(
    slug: string,
    userId: number,
    dto: UpdateArticleFieldsDto,
  ): Promise<ArticleResponseDto> {
    const article = await this.findOneBySlug(slug);
    if (article.authorId !== userId) {
      throw new ForbiddenException(this.i18n.t('articles.FORBIDDEN'));
    }

    if (dto.title !== undefined) {
      article.title = dto.title;
      article.slug = generateSlug(dto.title);
    }
    if (dto.description !== undefined) {
      article.description = dto.description;
    }
    if (dto.body !== undefined) {
      article.body = dto.body;
    }

    const saved = await this.articlesRepository.save(article);
    return new ArticleResponseDto(await this.toArticleDto(saved, userId));
  }

  async remove(slug: string, userId: number): Promise<void> {
    const article = await this.findOneBySlug(slug);
    if (article.authorId !== userId) {
      throw new ForbiddenException(this.i18n.t('articles.FORBIDDEN'));
    }

    await this.articlesRepository.delete(article.id);
  }

  async favorite(slug: string, userId: number): Promise<ArticleResponseDto> {
    const article = await this.findOneBySlug(slug);

    const alreadyFavorited = await this.favoritesRepository.count({
      where: { userId, articleId: article.id },
    });
    if (!alreadyFavorited) {
      await this.favoritesRepository.save(
        this.favoritesRepository.create({ userId, articleId: article.id }),
      );
    }

    return new ArticleResponseDto(await this.toArticleDto(article, userId));
  }

  async unfavorite(slug: string, userId: number): Promise<ArticleResponseDto> {
    const article = await this.findOneBySlug(slug);
    await this.favoritesRepository.delete({ userId, articleId: article.id });
    return new ArticleResponseDto(await this.toArticleDto(article, userId));
  }

  async addComment(slug: string, authorId: number, body: string): Promise<CommentResponseDto> {
    const article = await this.findOneBySlug(slug);
    const comment = this.commentsRepository.create({ body, articleId: article.id, authorId });
    const saved = await this.commentsRepository.save(comment);

    const author = (await this.usersService.findOne(authorId))!;
    // The viewer is the comment's own author here, so following-self is always false.
    return new CommentResponseDto(saved, new ProfileDto(author, false));
  }

  async getComments(slug: string, viewerId?: number): Promise<CommentsResponseDto> {
    const article = await this.findOneBySlug(slug);
    const comments = await this.commentsRepository.find({
      where: { articleId: article.id },
      relations: { author: true },
      order: { createdAt: 'DESC' },
    });

    const authorIds = [...new Set(comments.map((comment) => comment.authorId))];
    const followingSet = viewerId
      ? await this.usersService.isFollowingMany(viewerId, authorIds)
      : new Set<number>();

    const commentDtos = comments.map(
      (comment) =>
        new CommentDto(comment, new ProfileDto(comment.author, followingSet.has(comment.authorId))),
    );

    return new CommentsResponseDto(commentDtos);
  }

  async removeComment(slug: string, commentId: number, userId: number): Promise<void> {
    const article = await this.findOneBySlug(slug);
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, articleId: article.id },
    });
    if (!comment) {
      throw new NotFoundException(this.i18n.t('articles.COMMENT_NOT_FOUND'));
    }
    if (comment.authorId !== userId) {
      throw new ForbiddenException(this.i18n.t('articles.FORBIDDEN'));
    }

    await this.commentsRepository.delete(comment.id);
  }

  private async findOneBySlug(slug: string): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
      relations: { author: true },
    });
    if (!article) {
      throw new NotFoundException(this.i18n.t('articles.ARTICLE_NOT_FOUND'));
    }
    return article;
  }

  private async toArticleDto(article: Article, viewerId?: number): Promise<ArticleDto> {
    const favoritesCount = await this.favoritesRepository.count({
      where: { articleId: article.id },
    });
    const favorited = viewerId
      ? (await this.favoritesRepository.count({ where: { userId: viewerId, articleId: article.id } })) > 0
      : false;
    const following = viewerId ? await this.usersService.isFollowing(viewerId, article.authorId) : false;

    return new ArticleDto(article, favorited, favoritesCount, new ProfileDto(article.author, following));
  }

  private async buildArticlesResponse(
    articles: Article[],
    articlesCount: number,
    viewerId?: number,
  ): Promise<ArticlesResponseDto> {
    const articleIds = articles.map((article) => article.id);
    const authorIds = [...new Set(articles.map((article) => article.authorId))];

    const favoritesCountMap = await this.getFavoritesCountMap(articleIds);
    const favoritedSet = viewerId
      ? await this.getFavoritedSet(viewerId, articleIds)
      : new Set<number>();
    const followingSet = viewerId
      ? await this.usersService.isFollowingMany(viewerId, authorIds)
      : new Set<number>();

    const articleDtos = articles.map(
      (article) =>
        new ArticleDto(
          article,
          favoritedSet.has(article.id),
          favoritesCountMap.get(article.id) ?? 0,
          new ProfileDto(article.author, followingSet.has(article.authorId)),
        ),
    );

    return new ArticlesResponseDto(articleDtos, articlesCount);
  }

  private async getFavoritesCountMap(articleIds: number[]): Promise<Map<number, number>> {
    if (!articleIds.length) {
      return new Map();
    }
    const rows = await this.favoritesRepository
      .createQueryBuilder('favorite')
      .select('favorite.articleId', 'articleId')
      .addSelect('COUNT(*)', 'count')
      .where('favorite.articleId IN (:...articleIds)', { articleIds })
      .groupBy('favorite.articleId')
      .getRawMany();

    return new Map(rows.map((row) => [Number(row.articleId), Number(row.count)]));
  }

  private async getFavoritedSet(viewerId: number, articleIds: number[]): Promise<Set<number>> {
    if (!articleIds.length) {
      return new Set();
    }
    const rows = await this.favoritesRepository.find({
      where: { userId: viewerId, articleId: In(articleIds) },
    });
    return new Set(rows.map((row) => row.articleId));
  }
}
