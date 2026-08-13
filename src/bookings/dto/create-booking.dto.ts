import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 1, description: 'ID của tour du lịch muốn đặt' })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  tourId: number;

  @ApiPropertyOptional({ example: 2, default: 1, description: 'Số lượng vé/chỗ đặt' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number = 1;
}
