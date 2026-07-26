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

function generateFormattedFilename(originalFilename: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const microseconds =
    String(now.getMilliseconds()).padStart(3, '0') +
    Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
  const ext = path.extname(originalFilename) || '.png';

  return `${year}${month}${day}${hours}${minutes}${seconds}${microseconds}${ext}`;
}

function extractUserFields(fields: any, bodyDto?: any): any {
  if (bodyDto?.user) return bodyDto.user;
  if (!fields) return {};
  const user: Record<string, any> = {};
  for (const key of Object.keys(fields)) {
    const val = fields[key]?.value !== undefined ? fields[key].value : fields[key];
    if (key.startsWith('user[')) {
      const fieldName = key.replace(/^user\[/, '').replace(/\]$/, '');
      user[fieldName] = val;
    } else if (key !== 'file' && key !== 'image' && key !== 'avatar') {
      user[key] = val;
    }
  }
  return Object.keys(user).length ? user : fields.user || {};
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  login(@Request() req) {
    return this.usersService.login(req.user);
  }

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto.user);
  }

  @Post('avatar')
  async uploadAvatar(@Request() req) {
    if (!req.isMultipart || !req.isMultipart()) {
      throw new BadRequestException('Request must be multipart/form-data');
    }

    const file = await req.file();
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPG, JPEG, and PNG images are allowed.',
      );
    }

    const buffer = await file.toBuffer();
    if (buffer.length > 5 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds maximum limit of 5MB.');
    }

    const filename = generateFormattedFilename(file.filename);
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

    const avatarFile = {
      filename,
      originalName: file.filename,
      mimeType: file.mimetype,
      size: buffer.length,
      relativePath: `uploads/avatars/${filename}`,
    };

    return this.usersService.update(
      req.user.userId,
      {},
      avatarFile,
    );
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    if (req.isMultipart && req.isMultipart()) {
      const part = await req.file();
      let avatarFile;

      if (part) {
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedMimeTypes.includes(part.mimetype)) {
          throw new BadRequestException(
            'Invalid file type. Only JPG, JPEG, and PNG images are allowed.',
          );
        }

        const buffer = await part.toBuffer();
        if (buffer.length > 5 * 1024 * 1024) {
          throw new BadRequestException('File size exceeds maximum limit of 5MB.');
        }

        const filename = generateFormattedFilename(part.filename);
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

        avatarFile = {
          filename,
          originalName: part.filename,
          mimeType: part.mimetype,
          size: buffer.length,
          relativePath: `uploads/avatars/${filename}`,
        };
      }

      const fields = part?.fields || req.body || {};
      const userFields = extractUserFields(fields, updateUserDto);

      return this.usersService.update(
        id,
        userFields,
        avatarFile,
      );
    }

    return this.usersService.update(
      id,
      updateUserDto?.user || updateUserDto || {},
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
