import { Body, Controller, Get, Put, Request, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Public } from './auth/public.decorator';
import { UsersService } from './users/users.service';
import { UpdateUserDto } from './users/dto/update-user.dto';

import { getBaseUrlFromRequest } from './common/utils/url.util';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('auth/logout')
  async logout(@Request() req) {
    return req.logout();
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getCurrentUser(@Request() req) {
    return this.usersService.getCurrentUser(req.user.userId, getBaseUrlFromRequest(req));
  }

  @UseGuards(JwtAuthGuard)
  @Put('user')
  updateCurrentUser(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, updateUserDto.user, getBaseUrlFromRequest(req));
  }

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
