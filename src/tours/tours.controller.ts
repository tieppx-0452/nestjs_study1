import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { ToursService } from './tours.service';
import { GetToursQueryDto } from './dto/tours.dto';

@Controller('v1/tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Public()
  @Get()
  findAll(@Query() query: GetToursQueryDto) {
    return this.toursService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.toursService.findOne(id);
  }
}
