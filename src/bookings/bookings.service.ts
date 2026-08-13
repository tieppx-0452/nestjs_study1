import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Tour } from '../tours/entities/tour.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
    private readonly dataSource: DataSource,
    @Optional() private readonly i18n: I18nService,
  ) { }

  async createBooking(userId: number, dto: CreateBookingDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tour = await queryRunner.manager.findOne(Tour, {
        where: { id: dto.tourId },
      });

      if (!tour) {
        throw new NotFoundException(
          this.i18n?.t('admin.TOUR_NOT_FOUND') || 'Tour not found',
        );
      }

      const quantity = dto.quantity || 1;
      const totalPrice = Number(tour.price) * quantity;

      const booking = queryRunner.manager.create(Booking, {
        userId,
        tourId: dto.tourId,
        status: BookingStatus.PENDING,
        totalPrice,
      });

      const savedBooking = await queryRunner.manager.save(booking);

      await queryRunner.commitTransaction();

      return {
        code: 201,
        messages: [],
        data: savedBooking,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelBooking(userId: number, bookingId: number) {
    const booking = await this.bookingRepository.findOneBy({ id: bookingId });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Forbidden resource');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only PENDING bookings can be cancelled');
    }

    booking.status = BookingStatus.CANCELLED;
    const updatedBooking = await this.bookingRepository.save(booking);

    return {
      code: 200,
      messages: [],
      data: updatedBooking,
    };
  }

  async findMyBookings(userId: number) {
    const bookings = await this.bookingRepository.find({
      where: { userId },
      relations: { tour: true },
      order: { id: 'DESC' },
    });

    return {
      code: 200,
      messages: [],
      data: bookings,
    };
  }
}
