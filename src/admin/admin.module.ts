import { Module } from '@nestjs/common';
import { AdminAuthModule } from './auth/admin-auth.module';
import { AdminToursModule } from './tours/admin-tours.module';
import { AdminBookingsModule } from './bookings/admin-bookings.module';

@Module({
  imports: [AdminAuthModule, AdminToursModule, AdminBookingsModule],
  exports: [AdminAuthModule, AdminToursModule, AdminBookingsModule],
})
export class AdminModule {}

