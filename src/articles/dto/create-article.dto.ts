import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateArticleFieldsDto {
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  title: string;

  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  description: string;

  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  body: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: i18nValidationMessage('validation.IS_STRING') })
  tagList?: string[];
}

export class CreateArticleDto {
  @ValidateNested()
  @Type(() => CreateArticleFieldsDto)
  article: CreateArticleFieldsDto;
}
