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
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;
}

export class CreateAdminTourDto {
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  title: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  description?: string;

  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage('validation.MIN') })
  price: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  location?: string;

  @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE_STRING') })
  startDate: string;

  @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE_STRING') })
  endDate: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  maxParticipants?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  categoryId?: number;

  @IsOptional()
  @IsString()
  image?: string;
}

export class UpdateAdminTourDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  title?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage('validation.MIN') })
  price?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  location?: string;

  @IsOptional()
  @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE_STRING') })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE_STRING') })
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  maxParticipants?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  categoryId?: number;

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
