import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminBookingsController } from './admin-bookings.controller';
import { AdminBookingsService } from './admin-bookings.service';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';

describe('AdminBookingsController & Service', () => {
  let controller: AdminBookingsController;
  let service: AdminBookingsService;
  let bookingRepository: any;

  const mockBooking = {
    id: 1,
    userId: 1,
    tourId: 10,
    status: BookingStatus.PENDING,
    totalPrice: 1500000,
    user: { id: 1, name: 'Test User', email: 'user@example.com' },
    tour: { id: 10, title: 'Test Tour', price: 1500000 },
  };

  beforeEach(async () => {
    bookingRepository = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminBookingsController],
      providers: [
        AdminBookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: bookingRepository,
        },
      ],
    }).compile();

    controller = module.get<AdminBookingsController>(AdminBookingsController);
    service = module.get<AdminBookingsService>(AdminBookingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated bookings list', async () => {
      bookingRepository.findAndCount.mockResolvedValue([[mockBooking], 1]);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result.code).toBe(200);
      expect(result.data.bookings).toHaveLength(1);
      expect(result.data.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a specific booking', async () => {
      bookingRepository.findOne.mockResolvedValue(mockBooking);

      const result = await controller.findOne(1);

      expect(result.code).toBe(200);
      expect(result.data).toEqual(mockBooking);
    });

    it('should throw NotFoundException if booking not found', async () => {
      bookingRepository.findOne.mockResolvedValue(null);

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update booking status to CONFIRMED', async () => {
      bookingRepository.findOne.mockResolvedValue(mockBooking);
      bookingRepository.save.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      });

      const result = await controller.updateStatus(1, {
        status: BookingStatus.CONFIRMED,
      });

      expect(result.code).toBe(200);
      expect(result.data.status).toBe(BookingStatus.CONFIRMED);
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking by changing status to CANCELLED', async () => {
      bookingRepository.findOne.mockResolvedValue(mockBooking);
      bookingRepository.save.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });

      const result = await controller.cancelBooking(1);

      expect(result.code).toBe(200);
      expect(result.data.status).toBe(BookingStatus.CANCELLED);
    });
  });
});
