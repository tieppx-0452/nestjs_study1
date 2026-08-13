import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
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
import { Public } from '../auth/public.decorator';
import { ToursService } from './tours.service';
import { SearchTourQueryDto } from './dto/search-tour.dto';
import { ReviewsService } from '../reviews/reviews.service';
import { CreateReviewDto } from '../reviews/dto/create-review.dto';
import { BookingsService } from '../bookings/bookings.service';
import { CreateBookingDto } from '../bookings/dto/create-booking.dto';

@ApiTags('Tours - Xem & Đánh giá Tour Du Lịch (v1)')
@Controller('v1/tours')
export class ToursController {
  constructor(
    private readonly toursService: ToursService,
    private readonly reviewsService: ReviewsService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Danh sách & Tìm kiếm nâng cao Tour' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách tour thành công' })
  @Get()
  findAll(@Query() query: SearchTourQueryDto) {
    return this.toursService.findAll(query);
  }

  @Public()
  @ApiOperation({ summary: 'Xem Chi Tiết Tour' })
  @ApiParam({ name: 'id', example: 1, description: 'ID của tour du lịch' })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết tour' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tour' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.toursService.findOne(id);
  }

  @Public()
  @ApiOperation({ summary: 'Xem danh sách đánh giá của Tour' })
  @ApiParam({ name: 'id', example: 1, description: 'ID của tour du lịch' })
  @ApiResponse({ status: 200, description: 'Danh sách đánh giá của tour' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tour' })
  @Get(':id/reviews')
  getReviews(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getTourReviews(id);
  }

  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Đăng bài đánh giá cho Tour (Người dùng đã đăng nhập)' })
  @ApiParam({ name: 'id', example: 1, description: 'ID của tour du lịch cần đánh giá' })
  @ApiResponse({ status: 201, description: 'Đăng bài đánh giá thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực JWT Token' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tour' })
  @Post(':id/reviews')
  @HttpCode(201)
  createReview(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(req.user.userId, id, dto);
  }

  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Đặt tour du lịch (Shortcut API)' })
  @ApiBody({ type: CreateBookingDto, description: 'Thông tin tour cần đặt' })
  @ApiResponse({ status: 201, description: 'Đặt tour thành công, trạng thái PENDING' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực JWT Token' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tour' })
  @Post()
  @HttpCode(201)
  createBooking(@Request() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(req.user.userId, dto);
  }

  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Hủy đơn đặt tour (Shortcut API)' })
  @ApiParam({ name: 'id', example: 1, description: 'ID của đơn hàng cần hủy' })
  @ApiResponse({ status: 200, description: 'Hủy đơn tour thành công' })
  @ApiResponse({ status: 400, description: 'Đơn hàng không ở trạng thái PENDING' })
  @ApiResponse({ status: 403, description: 'Không có quyền hủy đơn của người khác' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  @Delete(':id')
  @HttpCode(200)
  cancelBooking(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.cancelBooking(req.user.userId, id);
  }
}
