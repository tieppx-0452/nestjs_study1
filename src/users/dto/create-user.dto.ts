import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class RegisterUserDto {
  @ApiProperty({ example: 'newuser@example.com', description: 'Email tài khoản người dùng' })
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  email: string;

  @ApiProperty({ example: 'newuser', description: 'Tên người dùng (username)' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  username: string;

  @ApiProperty({ example: 'NewUserPass123!', description: 'Mật khẩu tài khoản' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  password: string;
}

export class CreateUserDto {
  @ApiProperty({ type: RegisterUserDto })
  @ValidateNested()
  @Type(() => RegisterUserDto)
  user: RegisterUserDto;
}
