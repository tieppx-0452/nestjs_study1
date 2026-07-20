import { ProfileDto } from '../../users/dto/profile-response.dto';
import { Comment } from '../entities/comment.entity';

export class CommentDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  body: string;
  author: ProfileDto;

  constructor(comment: Comment, author: ProfileDto) {
    this.id = comment.id;
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
    this.body = comment.body;
    this.author = author;
  }
}

export class CommentResponseDto {
  comment: CommentDto;

  constructor(comment: Comment, author: ProfileDto) {
    this.comment = new CommentDto(comment, author);
  }
}

export class CommentsResponseDto {
  comments: CommentDto[];

  constructor(comments: CommentDto[]) {
    this.comments = comments;
  }
}
