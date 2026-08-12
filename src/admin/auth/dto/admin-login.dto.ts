import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Địa chỉ email của Quản trị viên (Admin)',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Aa@123456',
    description: 'Mật khẩu đăng nhập Admin',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
