import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
  Request,
  UseGuards,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { Public } from '../auth/public.decorator';
import { getBaseUrlFromRequest } from '../common/utils/url.util';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  login(@Request() req) {
    return this.usersService.login(req.user, getBaseUrlFromRequest(req));
  }

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.usersService.create(createUserDto.user, getBaseUrlFromRequest(req));
  }

  @Post('avatar')
  async uploadAvatar(@Request() req) {
    const file = await req.file();
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.');
    }

    const buffer = await file.toBuffer();
    if (buffer.length > 5 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds maximum limit of 5MB.');
    }

    const fileExt = path.extname(file.filename) || '.png';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt}`;
    const avatarsDir = path.join(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(avatarsDir)) {
      fs.mkdirSync(avatarsDir, { recursive: true, mode: 0o755 });
    } else {
      try {
        fs.chmodSync(avatarsDir, 0o755);
      } catch (e) {}
    }

    const filePath = path.join(avatarsDir, filename);
    await fs.promises.writeFile(filePath, buffer);

    const relativePath = `uploads/avatars/${filename}`;
    const baseUrl = getBaseUrlFromRequest(req);

    return this.usersService.updateAvatar(
      req.user.userId,
      {
        relativePath,
        originalName: file.filename,
        mimeType: file.mimetype,
        size: buffer.length,
      },
      baseUrl,
    );
  }

  @Get()
  findAll(@Request() req) {
    return this.usersService.findAll(getBaseUrlFromRequest(req));
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.usersService.findOne(id, getBaseUrlFromRequest(req));
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return this.usersService.update(id, updateUserDto.user, getBaseUrlFromRequest(req));
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
