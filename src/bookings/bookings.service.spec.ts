import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BookingsService } from './bookings.service';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Tour } from '../tours/entities/tour.entity';

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingRepository: any;
  let tourRepository: any;
  let queryRunnerMock: any;
  let dataSourceMock: any;

  beforeEach(async () => {
    bookingRepository = {
      findOneBy: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    tourRepository = {
      findOneBy: jest.fn(),
    };

    queryRunnerMock = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      },
    };

    dataSourceMock = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: getRepositoryToken(Booking), useValue: bookingRepository },
        { provide: getRepositoryToken(Tour), useValue: tourRepository },
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBooking', () => {
    it('should throw NotFoundException if tour not found in transaction', async () => {
      queryRunnerMock.manager.findOne.mockResolvedValue(null);

      await expect(
        service.createBooking(1, { tourId: 999, quantity: 2 }),
      ).rejects.toThrow(NotFoundException);

      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });

    it('should create booking inside transaction and return created booking', async () => {
      const mockTour = { id: 1, title: 'Tour Phu Quoc', price: 1000000 };
      const mockBooking = {
        id: 10,
        userId: 1,
        tourId: 1,
        status: BookingStatus.PENDING,
        totalPrice: 2000000,
      };

      queryRunnerMock.manager.findOne.mockResolvedValue(mockTour);
      queryRunnerMock.manager.create.mockReturnValue(mockBooking);
      queryRunnerMock.manager.save.mockResolvedValue(mockBooking);

      const result = await service.createBooking(1, { tourId: 1, quantity: 2 });

      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
      expect(result.code).toEqual(201);
      expect(result.data).toEqual(mockBooking);
    });
  });

  describe('cancelBooking', () => {
    it('step 1: should throw NotFoundException (404) if booking does not exist', async () => {
      bookingRepository.findOneBy.mockResolvedValue(null);

      await expect(service.cancelBooking(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('step 2: should throw ForbiddenException (403) if booking belongs to another user', async () => {
      const mockBooking = {
        id: 10,
        userId: 2, // belongs to user 2
        status: BookingStatus.PENDING,
      };
      bookingRepository.findOneBy.mockResolvedValue(mockBooking);

      await expect(service.cancelBooking(1, 10)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('step 3: should throw BadRequestException (400) if booking is not PENDING', async () => {
      const mockBooking = {
        id: 10,
        userId: 1,
        status: BookingStatus.CONFIRMED, // not PENDING
      };
      bookingRepository.findOneBy.mockResolvedValue(mockBooking);

      await expect(service.cancelBooking(1, 10)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('success: should cancel PENDING booking owned by user (200)', async () => {
      const mockBooking = {
        id: 10,
        userId: 1,
        status: BookingStatus.PENDING,
      };
      const cancelledBooking = {
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      };

      bookingRepository.findOneBy.mockResolvedValue(mockBooking);
      bookingRepository.save.mockResolvedValue(cancelledBooking);

      const result = await service.cancelBooking(1, 10);

      expect(result.code).toEqual(200);
      expect(result.data.status).toEqual(BookingStatus.CANCELLED);
    });
  });

  describe('findMyBookings', () => {
    it('should return bookings owned by user', async () => {
      const mockBookings = [
        { id: 1, userId: 1, tourId: 1, status: BookingStatus.PENDING },
      ];
      bookingRepository.find.mockResolvedValue(mockBookings);

      const result = await service.findMyBookings(1);

      expect(result.code).toEqual(200);
      expect(result.data).toEqual(mockBookings);
    });
  });
});
