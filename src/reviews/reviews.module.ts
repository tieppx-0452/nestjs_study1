import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Tour } from '../tours/entities/tour.entity';
import { ReviewsService } from './reviews.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Tour]), CommonModule],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
