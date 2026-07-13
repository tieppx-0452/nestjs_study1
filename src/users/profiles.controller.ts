import { Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from '../auth/public.decorator';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { ProfileResponseDto } from './dto/profile-response.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':username')
  async getProfile(@Param('username') username: string): Promise<ProfileResponseDto> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new ProfileResponseDto(user);
  }
}
