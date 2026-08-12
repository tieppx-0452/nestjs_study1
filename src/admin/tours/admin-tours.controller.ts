import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminToursService } from './admin-tours.service';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { Role } from '../../users/entities/user.entity';
import {
  CreateAdminTourDto,
  GetAdminToursQueryDto,
  UpdateAdminTourDto,
} from './dto/admin-tours.dto';

@ApiTags('Admin Tours - Quản lý CRUD Tour (Admin v1)')
@ApiBearerAuth('bearerAuth')
@Controller('v1/admin/tours')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminToursController {
  constructor(private readonly adminToursService: AdminToursService) {}

  @ApiOperation({ summary: 'Lấy danh sách Tour cho Admin (Phân trang & Tìm kiếm)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách tour thành công' })
  @ApiResponse({ status: 403, description: 'Yêu cầu quyền ADMIN' })
  @Get()
  findAll(@Query() query: GetAdminToursQueryDto) {
    return this.adminToursService.findAll(query);
  }

  @ApiOperation({ summary: 'Xem chi tiết Tour cho Admin' })
  @ApiParam({ name: 'id', example: 1, description: 'ID tour du lịch' })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết tour' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tour' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminToursService.findOne(id);
  }

  @ApiOperation({ summary: 'Tạo mới Tour du lịch (Admin)' })
  @ApiResponse({ status: 201, description: 'Tạo tour thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu DTO không hợp lệ' })
  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateAdminTourDto) {
    return this.adminToursService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin Tour (Admin)' })
  @ApiParam({ name: 'id', example: 1, description: 'ID tour cần cập nhật' })
  @ApiResponse({ status: 200, description: 'Cập nhật tour thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tour' })
  @Put(':id')
  @HttpCode(200)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminTourDto,
  ) {
    return this.adminToursService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa Tour du lịch (Admin)' })
  @ApiParam({ name: 'id', example: 1, description: 'ID tour cần xóa' })
  @ApiResponse({ status: 200, description: 'Xóa tour thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tour' })
  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminToursService.remove(id);
  }
}
