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
import { AdminToursService } from './admin-tours.service';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { Role } from '../../users/entities/user.entity';
import {
  CreateAdminTourDto,
  GetAdminToursQueryDto,
  UpdateAdminTourDto,
} from './dto/admin-tours.dto';

@Controller('v1/admin/tours')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminToursController {
  constructor(private readonly adminToursService: AdminToursService) {}

  @Get()
  findAll(@Query() query: GetAdminToursQueryDto) {
    return this.adminToursService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminToursService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateAdminTourDto) {
    return this.adminToursService.create(dto);
  }

  @Put(':id')
  @HttpCode(200)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminTourDto,
  ) {
    return this.adminToursService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminToursService.remove(id);
  }
}
