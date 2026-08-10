import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsDateYMD } from '../../common/validators/date-validators';

export class GetToursQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsDateYMD({
    message: i18nValidationMessage('validation.INVALID_DATE_FORMAT'),
  })
  startDate?: string;

  @IsOptional()
  @IsString()
  @IsDateYMD({
    message: i18nValidationMessage('validation.INVALID_DATE_FORMAT'),
  })
  endDate?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;
}
