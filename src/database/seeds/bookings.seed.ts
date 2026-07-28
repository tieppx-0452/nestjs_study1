import { DataSource } from 'typeorm';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';
import { User } from '../../users/entities/user.entity';
import { Tour } from '../../tours/entities/tour.entity';

export async function seedBookings(
  dataSource: DataSource,
  users: User[],
  tours: Tour[],
): Promise<Booking[]> {
  const bookingRepository = dataSource.getRepository(Booking);

  const statuses = [
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.REJECTED,
    BookingStatus.CANCELLED,
  ];

  const bookings: Partial<Booking>[] = [];

  const userIds = users.map((user) => user.id);
  const tourIds = tours.map((tour) => tour.id);

  for (let i = 0; i < 50; i++) {
    const status = statuses[(i - 1) % statuses.length];

    bookings.push({
      userId: userIds[i],
      tourId: tourIds[i],
      status,
      totalPrice: 150000,
    });
  }

  await bookingRepository
    .createQueryBuilder()
    .insert()
    .into(Booking)
    .values(bookings)
    .orIgnore()
    .execute();

  return bookingRepository.find();
}
