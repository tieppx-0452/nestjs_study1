import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

const posts: Post[] = [
  { id: 1, title: 'First post', content: 'This is the first post' },
  { id: 2, title: 'Second post', content: 'This is the second post' },
  { id: 3, title: 'Third post', content: 'This is the third post' },
];

@Injectable()
export class PostsService {
  create(createPostDto: CreatePostDto) {
    return 'This action adds a new post';
  }

  findAll() {
    return posts;
  }

  findOne(id: number) {
    return posts.find((post) => post.id === id);
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    let post = posts.find((post) => post.id === id);
    if (!post) {
      return 'Post not found';
    }
    // Update the post with the new data
    Object.assign(post, updatePostDto);
    return post;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
