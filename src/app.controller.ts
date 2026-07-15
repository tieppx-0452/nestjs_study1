import { Body, Controller, Get, Put, Request, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Public } from './auth/public.decorator';
import { AuthService } from './auth/auth.service';
import { UsersService, toUserResponse } from './users/users.service';
import { UpdateUserDto } from './users/dto/update-user.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
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
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Put('user')
  async updateCurrentUser(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(
      req.user.userId,
      updateUserDto.user,
    );
    const { access_token } = await this.authService.login(user);
    return toUserResponse(user, access_token);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
