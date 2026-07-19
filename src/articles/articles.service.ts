import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ProfileDto } from '../users/dto/profile-response.dto';
import { Article } from './entities/article.entity';
import { Favorite } from './entities/favorite.entity';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import { ArticleDto, ArticlesResponseDto } from './dto/article-response.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
    private readonly usersService: UsersService,
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
