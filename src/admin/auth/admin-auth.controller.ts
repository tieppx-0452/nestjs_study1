import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { Public } from '../../auth/public.decorator';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { Role } from '../../users/entities/user.entity';
import { AdminLoginDto } from './dto/admin-login.dto';

@ApiTags('Admin Auth - Xác thực Quản trị viên (v1)')
@Controller('v1/admin')
@UseGuards(RolesGuard)
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Public()
  @ApiOperation({ summary: 'Đăng nhập Quản trị viên (Admin)' })
  @ApiBody({ type: AdminLoginDto, description: 'Thông tin email và password tài khoản Admin' })
  @ApiResponse({ status: 200, description: 'Đăng nhập Admin thành công' })
  @ApiResponse({ status: 401, description: 'Sai email hoặc mật khẩu' })
  @ApiResponse({ status: 403, description: 'Tài khoản không phải ADMIN' })
  @HttpCode(200)
  @Post('login')
  login(@Body() dto: AdminLoginDto) {
    return this.adminAuthService.login(dto);
  }

  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Đăng xuất Quản trị viên (Admin)' })
  @ApiResponse({ status: 200, description: 'Đăng xuất Admin thành công' })
  @ApiResponse({ status: 403, description: 'Yêu cầu quyền ADMIN' })
  @Roles(Role.ADMIN)
  @HttpCode(200)
  @Post('logout')
  logout(@Request() req) {
    req.logout();
    return this.adminAuthService.logout();
  }
}
