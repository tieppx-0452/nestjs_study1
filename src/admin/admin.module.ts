import { Module } from '@nestjs/common';
import { AdminAuthModule } from './auth/admin-auth.module';
import { AdminToursModule } from './tours/admin-tours.module';

@Module({
  imports: [AdminAuthModule, AdminToursModule],
  exports: [AdminAuthModule, AdminToursModule],
})
export class AdminModule {}
