import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { I18nService } from 'nestjs-i18n';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';
import { QueryAdminBookingsDto } from './dto/admin-bookings.dto';

@Injectable()
export class AdminBookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @Optional() private readonly eventEmitter?: EventEmitter2,
    @Optional() private readonly i18n?: I18nService,
  ) { }

  async findAll(query: QueryAdminBookingsDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }

    const [bookings, total] = await this.bookingRepository.findAndCount({
      where,
      relations: { user: true, tour: true },
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      code: 200,
      messages: [],
      data: {
        bookings,
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
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: { user: true, tour: true },
    });

    if (!booking) {
      throw new NotFoundException(
        this.i18n?.t('admin.BOOKING_NOT_FOUND'),
      );
    }

    return {
      code: 200,
      messages: [],
      data: booking,
    };
  }

  async updateStatus(id: number, status: BookingStatus) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: { user: true, tour: true },
    });

    if (!booking) {
      throw new NotFoundException(
        this.i18n?.t('admin.BOOKING_NOT_FOUND'),
      );
    }

    booking.status = status;
    const savedBooking = await this.bookingRepository.save(booking);

    if (status === BookingStatus.CONFIRMED || status === BookingStatus.REJECTED) {
      this.eventEmitter?.emit('booking.updated', {
        bookingId: savedBooking.id,
        userEmail: booking.user?.email || '',
        tourName: (booking.tour as any)?.title || (booking.tour as any)?.name || '',
        status: savedBooking.status,
      });
    }

    return {
      code: 200,
      messages: [
        this.i18n?.t('admin.BOOKING_UPDATED_SUCCESS')
      ],
      data: savedBooking,
    };
  }

  async cancelBooking(id: number) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: { user: true, tour: true },
    });

    if (!booking) {
      throw new NotFoundException(
        this.i18n?.t('admin.BOOKING_NOT_FOUND'),
      );
    }

    booking.status = BookingStatus.CANCELLED;
    const savedBooking = await this.bookingRepository.save(booking);

    return {
      code: 200,
      messages: [
        this.i18n?.t('admin.BOOKING_CANCELLED_SUCCESS')
      ],
      data: savedBooking,
    };
  }
}
