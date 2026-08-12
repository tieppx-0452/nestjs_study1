import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Tour } from '../../../tours/entities/tour.entity';

export class GetAdminToursQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1, description: 'Số trang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10, description: 'Số bản ghi mỗi trang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'Fansipan', description: 'Từ khóa tìm kiếm tour' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, description: 'Lọc theo ID danh mục' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;
}

export class CreateAdminTourDto {
  @ApiProperty({ example: 'Tour Leo Núi Fansipan 3D2N', description: 'Tiêu đề tour du lịch' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  title: string;

  @ApiPropertyOptional({ example: 'Hành trình chinh phục nóc nhà Đông Dương...', description: 'Mô tả chi tiết tour' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  description?: string;

  @ApiProperty({ example: 4500000, description: 'Giá niêm yết tour du lịch (VNĐ)' })
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage('validation.MIN') })
  price: number;

  @ApiPropertyOptional({ example: 'Sapa, Lào Cai', description: 'Địa điểm tour' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  location?: string;

  @ApiProperty({ example: '2026-09-01T00:00:00Z', description: 'Ngày bắt đầu tour (ISO string)' })
  @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE_STRING') })
  startDate: string;

  @ApiProperty({ example: '2026-09-03T00:00:00Z', description: 'Ngày kết thúc tour (ISO string)' })
  @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE_STRING') })
  endDate: string;

  @ApiPropertyOptional({ example: 15, default: 10, description: 'Số lượng khách tối đa' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  maxParticipants?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID danh mục tour' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  categoryId?: number;

  @ApiPropertyOptional({ example: 'uploads/tours/fansipan.jpg', description: 'Đường dẫn/file ảnh đại diện tour' })
  @IsOptional()
  @IsString()
  image?: string;
}

export class UpdateAdminTourDto {
  @ApiPropertyOptional({ example: 'Tour Leo Núi Fansipan 3D2N (Cập nhật)', description: 'Tiêu đề tour du lịch' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  title?: string;

  @ApiPropertyOptional({ example: 'Mô tả cập nhật...', description: 'Mô tả chi tiết tour' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  description?: string;

  @ApiPropertyOptional({ example: 4800000, description: 'Giá mới' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage('validation.MIN') })
  price?: number;

  @ApiPropertyOptional({ example: 'Sapa, Lào Cai', description: 'Địa điểm tour' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  location?: string;

  @ApiPropertyOptional({ example: '2026-09-01T00:00:00Z', description: 'Ngày bắt đầu mới' })
  @IsOptional()
  @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE_STRING') })
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-09-03T00:00:00Z', description: 'Ngày kết thúc mới' })
  @IsOptional()
  @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE_STRING') })
  endDate?: string;

  @ApiPropertyOptional({ example: 20, description: 'Số lượng khách tối đa mới' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  maxParticipants?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID danh mục mới' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  categoryId?: number;

  @ApiPropertyOptional({ example: 'uploads/tours/fansipan.jpg', description: 'Ảnh đại diện mới' })
  @IsOptional()
  @IsString()
  image?: string;
}

export class AdminTourResponseDto {
  id: number;
  title: string;
  description: string | null;
  price: number;
  location: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  categoryId: number | null;
  category: any | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(tour: Tour, imageUrl?: string | null) {
    this.id = tour.id;
    this.title = tour.title;
    this.description = tour.description ?? null;
    this.price = Number(tour.price);
    this.location = tour.location || '';
    this.startDate = tour.startDate;
    this.endDate = tour.endDate;
    this.maxParticipants = tour.maxParticipants;
    this.categoryId = tour.categoryId ?? null;
    this.category = tour.category ? { id: tour.category.id, name: tour.category.name } : null;
    this.image = imageUrl !== undefined ? imageUrl : null;
    this.createdAt = tour.createdAt;
    this.updatedAt = tour.updatedAt;
  }
}
