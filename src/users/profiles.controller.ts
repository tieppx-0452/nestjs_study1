import { Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
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
  getProfile(@Param('username') username: string, @Request() req): Promise<ProfileResponseDto> {
    return this.usersService.getProfile(username, req.user?.userId);
  }

  @Post(':username/follow')
  followUser(@Param('username') username: string, @Request() req): Promise<ProfileResponseDto> {
    return this.usersService.follow(req.user.userId, username);
  }

  @Delete(':username/follow')
  unfollowUser(@Param('username') username: string, @Request() req): Promise<ProfileResponseDto> {
    return this.usersService.unfollow(req.user.userId, username);
  }
}
