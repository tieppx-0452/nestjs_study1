import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('Bookings - Đặt & Quản lý đơn Tour (v1)')
@ApiBearerAuth('bearerAuth')
@Controller('v1/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @ApiOperation({ summary: 'Tạo đơn đặt tour mới (Người dùng đã đăng nhập)' })
  @ApiBody({ type: CreateBookingDto, description: 'Thông tin tour cần đặt' })
  @ApiResponse({ status: 201, description: 'Tạo đơn hàng thành công, trạng thái PENDING' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực JWT Token' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tour' })
  @Post()
  @HttpCode(201)
  createBooking(@Request() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Lấy danh sách đơn đặt tour của tôi' })
  @ApiResponse({ status: 200, description: 'Danh sách đơn đặt tour' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực JWT Token' })
  @Get()
  findMyBookings(@Request() req: any) {
    return this.bookingsService.findMyBookings(req.user.userId);
  }

  @ApiOperation({ summary: 'Hủy đơn đặt tour (chỉ dành cho đơn PENDING của tôi)' })
  @ApiParam({ name: 'id', example: 1, description: 'ID của đơn hàng cần hủy' })
  @ApiResponse({ status: 200, description: 'Hủy đơn đặt tour thành công' })
  @ApiResponse({ status: 400, description: 'Đơn hàng không ở trạng thái PENDING' })
  @ApiResponse({ status: 403, description: 'Không có quyền hủy đơn hàng của người khác' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  @Delete(':id')
  @HttpCode(200)
  cancelBooking(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.cancelBooking(req.user.userId, id);
  }
}
