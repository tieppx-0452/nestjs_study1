import {
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { Review } from './entities/review.entity';
import { Tour } from '../tours/entities/tour.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UrlHelperService } from '../common/services/url-helper.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
    private readonly urlHelper: UrlHelperService,
    @Optional() private readonly i18n: I18nService,
  ) { }

  async createReview(userId: number, tourId: number, dto: CreateReviewDto) {
    const tour = await this.tourRepository.findOneBy({ id: tourId });

    if (!tour) {
      throw new NotFoundException(
        this.i18n?.t('admin.TOUR_NOT_FOUND'),
      );
    }

    const review = this.reviewRepository.create({
      userId,
      tourId,
      comment: dto.comment,
    });

    const savedReview = await this.reviewRepository.save(review);

    return {
      code: 201,
      messages: [],
      data: savedReview,
    };
  }

  async getTourReviews(tourId: number) {
    const tour = await this.tourRepository.findOneBy({ id: tourId });

    if (!tour) {
      throw new NotFoundException(
        this.i18n?.t('admin.TOUR_NOT_FOUND'),
      );
    }

    const reviews = await this.reviewRepository.find({
      where: { tourId },
      relations: { user: true },
      order: { id: 'DESC' },
    });

    const formattedReviews = reviews.map((r) => ({
      ...r,
      user: r.user
        ? {
          id: r.user.id,
          name: r.user.name,
          avatar: r.user.avatar,
          avatar_url: r.user.avatar
            ? this.urlHelper.asset(r.user.avatar)
            : null,
        }
        : null,
    }));

    return {
      code: 200,
      messages: [],
      data: formattedReviews,
    };
  }
}
