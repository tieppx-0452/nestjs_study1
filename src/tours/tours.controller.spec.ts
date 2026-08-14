import { Test, TestingModule } from '@nestjs/testing';
import { ToursController } from './tours.controller';
import { ToursService } from './tours.service';
import { ReviewsService } from '../reviews/reviews.service';
import { BookingsService } from '../bookings/bookings.service';

describe('ToursController', () => {
  let controller: ToursController;
  let toursService: any;
  let reviewsService: any;

  beforeEach(async () => {
    toursService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    };
    reviewsService = {
      createReview: jest.fn(),
      getTourReviews: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ToursController],
      providers: [
        { provide: ToursService, useValue: toursService },
        { provide: ReviewsService, useValue: reviewsService },
        { provide: BookingsService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ToursController>(ToursController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call toursService.findAll and return list', async () => {
      const query = { q: 'PhuQuoc', page: 1, limit: 10 };
      const mockResult = {
        code: 200,
        messages: [],
        data: {
          tours: [{ id: 1, title: 'Tour Phu Quoc' }],
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        },
      };
      toursService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(query);
      expect(toursService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findOne', () => {
    it('should call toursService.findOne and return detail', async () => {
      const mockResult = {
        code: 200,
        messages: [],
        data: { id: 1, title: 'Tour Phu Quoc' },
      };
      toursService.findOne.mockResolvedValue(mockResult);

      const result = await controller.findOne(1);
      expect(toursService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResult);
    });
  });

  describe('createReview', () => {
    it('should call reviewsService.createReview and return created review', async () => {
      const mockResult = {
        code: 201,
        messages: [],
        data: { id: 1, userId: 10, tourId: 1, comment: 'Tuyệt vời' },
      };
      reviewsService.createReview.mockResolvedValue(mockResult);

      const req = { user: { userId: 10 } };
      const result = await controller.createReview(req, 1, { comment: 'Tuyệt vời' });

      expect(reviewsService.createReview).toHaveBeenCalledWith(10, 1, { comment: 'Tuyệt vời' });
      expect(result).toEqual(mockResult);
    });
  });
});
