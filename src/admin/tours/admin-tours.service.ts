import {
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { Tour } from '../../tours/entities/tour.entity';
import { Category } from '../../categories/entities/category.entity';
import { UrlHelperService } from '../../common/services/url-helper.service';
import {
  AdminTourResponseDto,
  CreateAdminTourDto,
  GetAdminToursQueryDto,
  UpdateAdminTourDto,
} from './dto/admin-tours.dto';

@Injectable()
export class AdminToursService {
  constructor(
    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly urlHelper: UrlHelperService,
    @Optional() private readonly i18n: I18nService,
  ) { }

  async findAll(query: GetAdminToursQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.search) {
      where.title = Like(`%${query.search}%`);
    }

    const [tours, total] = await this.tourRepository.findAndCount({
      where,
      relations: { category: true },
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    const formattedTours = tours.map(
      (tour) =>
        new AdminTourResponseDto(
          tour,
          (tour as any).image ? (this.urlHelper.asset((tour as any).image) as string) : null,
        ),
    );

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
      relations: { category: true },
    });

    if (!tour) {
      throw new NotFoundException(
        this.i18n.t('admin.TOUR_NOT_FOUND'),
      );
    }

    return {
      code: 200,
      messages: [],
      data: new AdminTourResponseDto(
        tour,
        (tour as any).image ? (this.urlHelper.asset((tour as any).image) as string) : null,
      ),
    };
  }

  async create(dto: CreateAdminTourDto) {
    if (dto.categoryId) {
      const categoryExists = await this.categoryRepository.findOneBy({
        id: dto.categoryId,
      });
      if (!categoryExists) {
        throw new NotFoundException(
          this.i18n.t('admin.CATEGORY_NOT_FOUND'),
        );
      }
    }

    const tour = this.tourRepository.create({
      title: dto.title,
      description: dto.description,
      price: dto.price,
      location: dto.location || 'N/A',
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      maxParticipants: dto.maxParticipants ?? 10,
      categoryId: dto.categoryId,
    });

    const savedTour = await this.tourRepository.save(tour);
    const fullTour = await this.tourRepository.findOne({
      where: { id: savedTour.id },
      relations: { category: true },
    });

    return {
      code: 201,
      messages: [this.i18n.t('admin.TOUR_CREATED_SUCCESS')],
      data: new AdminTourResponseDto(
        fullTour || savedTour,
        (savedTour as any).image ? (this.urlHelper.asset((savedTour as any).image) as string) : null,
      ),
    };
  }

  async update(id: number, dto: UpdateAdminTourDto) {
    const tour = await this.tourRepository.findOneBy({ id });
    if (!tour) {
      throw new NotFoundException(
        this.i18n.t('admin.TOUR_NOT_FOUND'),
      );
    }

    if (dto.categoryId !== undefined && dto.categoryId !== null) {
      const categoryExists = await this.categoryRepository.findOneBy({
        id: dto.categoryId,
      });
      if (!categoryExists) {
        throw new NotFoundException(
          this.i18n.t('admin.CATEGORY_NOT_FOUND'),
        );
      }
      tour.categoryId = dto.categoryId;
    }

    if (dto.title !== undefined) tour.title = dto.title;
    if (dto.description !== undefined) tour.description = dto.description;
    if (dto.price !== undefined) tour.price = dto.price;
    if (dto.location !== undefined) tour.location = dto.location;
    if (dto.startDate !== undefined) tour.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) tour.endDate = new Date(dto.endDate);
    if (dto.maxParticipants !== undefined) tour.maxParticipants = dto.maxParticipants;

    const savedTour = await this.tourRepository.save(tour);
    const fullTour = await this.tourRepository.findOne({
      where: { id: savedTour.id },
      relations: { category: true },
    });

    return {
      code: 200,
      messages: [this.i18n.t('admin.TOUR_UPDATED_SUCCESS')],
      data: new AdminTourResponseDto(
        fullTour || savedTour,
        (savedTour as any).image ? (this.urlHelper.asset((savedTour as any).image) as string) : null,
      ),
    };
  }

  async remove(id: number) {
    const tour = await this.tourRepository.findOneBy({ id });
    if (!tour) {
      throw new NotFoundException(
        this.i18n.t('admin.TOUR_NOT_FOUND'),
      );
    }

    await this.tourRepository.delete(id);

    return {
      code: 200,
      messages: [this.i18n.t('admin.TOUR_DELETED_SUCCESS')],
      data: null,
    };
  }
}
