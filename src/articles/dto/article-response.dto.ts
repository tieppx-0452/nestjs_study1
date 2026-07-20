import { ProfileDto } from '../../users/dto/profile-response.dto';
import { Article } from '../entities/article.entity';

export class ArticleDto {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: Date;
  updatedAt: Date;
  favorited: boolean;
  favoritesCount: number;
  author: ProfileDto;

  constructor(article: Article, favorited: boolean, favoritesCount: number, author: ProfileDto) {
    this.slug = article.slug;
    this.title = article.title;
    this.description = article.description;
    this.body = article.body;
    this.tagList = article.tagList;
    this.createdAt = article.createdAt;
    this.updatedAt = article.updatedAt;
    this.favorited = favorited;
    this.favoritesCount = favoritesCount;
    this.author = author;
  }
}

export class ArticlesResponseDto {
  articles: ArticleDto[];
  articlesCount: number;

  constructor(articles: ArticleDto[], articlesCount: number) {
    this.articles = articles;
    this.articlesCount = articlesCount;
  }
}

export class ArticleResponseDto {
  article: ArticleDto;

  constructor(article: ArticleDto) {
    this.article = article;
  }
}
