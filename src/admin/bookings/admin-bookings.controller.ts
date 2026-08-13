import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminBookingsService } from './admin-bookings.service';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { Role } from '../../users/entities/user.entity';
import {
  QueryAdminBookingsDto,
  UpdateBookingStatusDto,
} from './dto/admin-bookings.dto';

@ApiTags('Admin Bookings - Quản lý đơn đặt tour (Admin v1)')
@ApiBearerAuth('bearerAuth')
@Controller('v1/admin/bookings')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminBookingsController {
  constructor(private readonly adminBookingsService: AdminBookingsService) {}

  @ApiOperation({ summary: 'Lấy danh sách các đơn đặt tour (Admin)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách đơn đặt tour thành công' })
  @ApiResponse({ status: 403, description: 'Yêu cầu quyền ADMIN' })
  @Get()
  findAll(@Query() query: QueryAdminBookingsDto) {
    return this.adminBookingsService.findAll(query);
  }

  @ApiOperation({ summary: 'Xem chi tiết đơn đặt tour (Admin)' })
  @ApiParam({ name: 'id', example: 1, description: 'ID đơn hàng' })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết đơn hàng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminBookingsService.findOne(id);
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái đơn đặt tour (Admin)' })
  @ApiParam({ name: 'id', example: 1, description: 'ID đơn hàng' })
  @ApiBody({ type: UpdateBookingStatusDto })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  @Patch(':id/status')
  @HttpCode(200)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.adminBookingsService.updateStatus(id, dto.status);
  }

  @ApiOperation({ summary: 'Hủy đơn đặt tour (Admin)' })
  @ApiParam({ name: 'id', example: 1, description: 'ID đơn hàng cần hủy' })
  @ApiResponse({ status: 200, description: 'Hủy đơn hàng thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  @Delete(':id')
  @HttpCode(200)
  cancelBooking(@Param('id', ParseIntPipe) id: number) {
    return this.adminBookingsService.cancelBooking(id);
  }
}
