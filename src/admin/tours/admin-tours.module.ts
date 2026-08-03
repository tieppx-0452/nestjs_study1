import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tour } from '../../tours/entities/tour.entity';
import { Category } from '../../categories/entities/category.entity';
import { CommonModule } from '../../common/common.module';
import { AdminToursController } from './admin-tours.controller';
import { AdminToursService } from './admin-tours.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tour, Category]), CommonModule],
  controllers: [AdminToursController],
  providers: [AdminToursService],
  exports: [AdminToursService],
})
export class AdminToursModule {}
