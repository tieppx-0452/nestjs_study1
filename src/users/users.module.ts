import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ProfilesController } from './profiles.controller';
import { AuthModule } from '../auth/auth.module';
import { User } from './entities/user.entity';
import { Follow } from './entities/follow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Follow]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController, ProfilesController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
