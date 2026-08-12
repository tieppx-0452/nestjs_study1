import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Public } from '../auth/public.decorator';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { ProfileResponseDto } from './dto/profile-response.dto';

@ApiTags('Profiles - Quản lý Profile (v1)')
@Controller()
export class ProfilesController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Lấy thông tin cá nhân (Profile) của tôi' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin cá nhân thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực JWT Token' })
  @Get('v1/profile')
  async getMyProfile(@Request() req: any) {
    const userId = req.user?.userId;
    const user = await this.usersService.findOne(userId);
    return {
      code: 200,
      messages: [],
      data: user,
    };
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiExcludeEndpoint()
  @Get('profiles/:username')
  getProfile(@Param('username') username: string, @Request() req: any): Promise<ProfileResponseDto> {
    return this.usersService.getProfile(username, req.user?.userId);
  }
}
