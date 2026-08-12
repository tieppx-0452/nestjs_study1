import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 'Tour rất tuyệt vời, trải nghiệm đáng nhớ!', description: 'Nội dung bài đánh giá' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
