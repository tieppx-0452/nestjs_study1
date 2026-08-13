import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tour } from './entities/tour.entity';
import { ToursController } from './tours.controller';
import { ToursService } from './tours.service';
import { CommonModule } from '../common/common.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tour]),
    CommonModule,
    ReviewsModule,
    BookingsModule,
  ],
  controllers: [ToursController],
  providers: [ToursService],
  exports: [ToursService],
})
export class ToursModule {}
