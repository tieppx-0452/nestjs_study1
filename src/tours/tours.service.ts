import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { Tour } from './entities/tour.entity';
import { GetToursQueryDto } from './dto/tours.dto';
import { UrlHelperService } from '../common/services/url-helper.service';

@Injectable()
export class ToursService {
  constructor(
    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
    private readonly urlHelper: UrlHelperService,
    @Optional() private readonly i18n: I18nService,
  ) {}

  async findAll(query: GetToursQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const qb = this.tourRepository
      .createQueryBuilder('tour')
      .leftJoinAndSelect('tour.category', 'category')
      .leftJoinAndSelect('tour.images', 'images');

    if (query.startDate) {
      qb.andWhere('tour.startDate >= :startDate', {
        startDate: query.startDate,
      });
    }
    if (query.endDate) {
      qb.andWhere('tour.endDate <= :endDate', { endDate: query.endDate });
    }

    const categoryId = query.categoryId;
    if (categoryId) {
      qb.andWhere('tour.categoryId = :categoryId', { categoryId });
    }

    const searchStr = query.q;
    if (searchStr) {
      qb.andWhere('tour.title ILIKE :search', { search: `%${searchStr}%` });
    }

    qb.orderBy('tour.id', 'DESC').skip(skip).take(limit);

    const [tours, total] = await qb.getManyAndCount();

    const formattedTours = tours.map((tour) => {
      const imagePath = (tour as any).image;
      return {
        ...tour,
        image: imagePath ? this.urlHelper.asset(imagePath) : null,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      code: 200,
      messages: [],
      data: {
        tours: formattedTours,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    };
  }

  async findOne(id: number) {
    const tour = await this.tourRepository.findOne({
      where: { id },
      relations: {
        category: true,
        images: true,
      },
    });

    if (!tour) {
      throw new NotFoundException(this.i18n?.t('admin.TOUR_NOT_FOUND'));
    }

    const imagePath = (tour as any).image;
    const formattedTour = {
      ...tour,
      image: imagePath ? this.urlHelper.asset(imagePath) : null,
    };

    return {
      code: 200,
      messages: [],
      data: formattedTour,
    };
  }
}
