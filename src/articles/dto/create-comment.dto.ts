import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateCommentFieldsDto {
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  body: string;
}

export class CreateCommentDto {
  @ValidateNested()
  @Type(() => CreateCommentFieldsDto)
  comment: CreateCommentFieldsDto;
}
