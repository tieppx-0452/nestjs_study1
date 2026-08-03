import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { Role, User } from '../../users/entities/user.entity';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Optional() private readonly i18n: I18nService,
  ) { }

  async login(dto: AdminLoginDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException(
        this.i18n.t('admin.INVALID_CREDENTIALS')
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid || !this.isAdmin(user.role)) {
      throw new UnauthorizedException(
        this.i18n.t('admin.INVALID_CREDENTIALS')
      );
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      code: 200,
      messages: [],
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          avatar: user.avatar ?? null,
          role: user.role,
        },
        token,
      },
    };
  }

  logout() {
    return {
      code: 200,
      messages: [this.i18n.t('admin.LOGOUT_SUCCESS')],
      data: null,
    };
  }

  isAdmin(role: Role) {
    return role === Role.ADMIN;
  }
}
