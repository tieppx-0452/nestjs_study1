import { Controller, Delete, Get, NotFoundException, Param, Post, Request, UseGuards } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { UsersService } from './users.service';
import { Public } from '../auth/public.decorator';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { ProfileResponseDto } from './dto/profile-response.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':username')
  async getProfile(@Param('username') username: string, @Request() req): Promise<ProfileResponseDto> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException(this.i18n.t('users.USER_NOT_FOUND'));
    }

    const following = req.user
      ? await this.usersService.isFollowing(req.user.userId, user.id)
      : false;

    return new ProfileResponseDto(user, following);
  }

  @Post(':username/follow')
  async followUser(@Param('username') username: string, @Request() req): Promise<ProfileResponseDto> {
    const target = await this.usersService.follow(req.user.userId, username);
    return new ProfileResponseDto(target, true);
  }

  @Delete(':username/follow')
  async unfollowUser(@Param('username') username: string, @Request() req): Promise<ProfileResponseDto> {
    const target = await this.usersService.unfollow(req.user.userId, username);
    return new ProfileResponseDto(target, false);
  }
}
