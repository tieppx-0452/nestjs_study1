import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { User } from './entities/user.entity';
import { Follow } from './entities/follow.entity';
import { RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserFieldsDto } from './dto/update-user.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { UrlHelperService } from '../common/services/url-helper.service';

const SALT_ROUNDS = 10;

export interface AvatarFileInfo {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  relativePath: string;
}

export function toUserResponse(
  user: User,
  token: string,
  urlHelper?: UrlHelperService,
) {
  const avatarUrl = user.avatar
    ? (urlHelper ? urlHelper.asset(user.avatar) : user.avatar)
    : null;

  return {
    user: {
      id: user.id,
      email: user.email,
      token,
      name: user.name ?? null,
      avatar: avatarUrl,
      role: user.role,
      bio: user.bio ?? null,
    },
  };
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Follow)
    private readonly followsRepository: Repository<Follow>,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
    private readonly urlHelper: UrlHelperService,
  ) { }

  private buildAuthResponse(user: User) {
    const token = this.jwtService.sign({
      email: user.email,
      sub: user.id,
      role: user.role,
    });
    return toUserResponse(user, token, this.urlHelper);
  }

  login(user: User) {
    return this.buildAuthResponse(user);
  }

  async getCurrentUser(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.buildAuthResponse(user);
  }

  async create(registerUserDto: RegisterUserDto) {
    const password = await bcrypt.hash(registerUserDto.password, SALT_ROUNDS);
    const user = this.usersRepository.create({ ...registerUserDto, password });

    let saved: User;
    try {
      saved = await this.usersRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(this.i18n.t('users.USERNAME_OR_EMAIL_EXISTS'));
      }
      throw error;
    }

    return this.buildAuthResponse(saved);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findByEmail(username);
  }

  async findAll() {
    const users = await this.usersRepository.find();
    return users.map((user) => ({
      ...user,
      avatar: user.avatar ? (this.urlHelper.asset(user.avatar) as string) : undefined,
    }));
  }

  async findOne(id: number): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) return null;
    return {
      ...user,
      avatar: user.avatar ? (this.urlHelper.asset(user.avatar) as string) : undefined,
    };
  }

  async update(
    id: number,
    updateUserDto: UpdateUserFieldsDto,
    avatarFile?: AvatarFileInfo,
  ) {
    const existingUser = await this.usersRepository.findOneBy({ id });
    if (!existingUser) {
      throw new NotFoundException(this.i18n.t('users.USER_NOT_FOUND'));
    }

    const { password, ...rest } = updateUserDto;
    const data: Partial<User> = { ...rest };

    if (password) {
      data.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    if (avatarFile) {
      if (existingUser.avatar && existingUser.avatar.startsWith('uploads/')) {
        const oldPath = join(process.cwd(), existingUser.avatar);
        if (existsSync(oldPath)) {
          try {
            unlinkSync(oldPath);
          } catch (e) { }
        }
      }

      data.avatar = avatarFile.relativePath;
    }

    try {
      await this.usersRepository.save({ ...existingUser, ...data });
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(this.i18n.t('users.USERNAME_OR_EMAIL_EXISTS'));
      }
      throw error;
    }

    const updatedUser = await this.usersRepository.findOneBy({ id });
    if (!updatedUser) {
      throw new NotFoundException(this.i18n.t('users.USER_NOT_FOUND'));
    }

    return this.buildAuthResponse(updatedUser);
  }

  async remove(id: number) {
    const res = await this.usersRepository.delete(id);
    if (res.affected === 0) {
      throw new NotFoundException(this.i18n.t('users.USER_NOT_FOUND'));
    }
    return { message: `User #${id} removed successfully` };
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const count = await this.followsRepository.count({
      where: { followerId, followingId },
    });
    return count > 0;
  }

  async isFollowingMany(followerId: number, followingIds: number[]): Promise<Set<number>> {
    if (!followingIds.length) {
      return new Set();
    }
    const rows = await this.followsRepository.find({
      where: { followerId, followingId: In(followingIds) },
    });
    return new Set(rows.map((row) => row.followingId));
  }

  async getFollowingIds(followerId: number): Promise<number[]> {
    const rows = await this.followsRepository.find({ where: { followerId } });
    return rows.map((row) => row.followingId);
  }

  private buildProfileResponse(user: User, following = false): ProfileResponseDto {
    const formattedUser = {
      ...user,
      avatar: user.avatar ? (this.urlHelper.asset(user.avatar) as string) : undefined,
    };
    return new ProfileResponseDto(formattedUser as User, following);
  }

  async getProfile(target: string, viewerId?: number): Promise<ProfileResponseDto> {
    let user = await this.findByEmail(target);
    if (!user && !isNaN(Number(target))) {
      user = await this.findOne(Number(target));
    }
    if (!user) {
      throw new NotFoundException(this.i18n.t('users.USER_NOT_FOUND'));
    }

    const following = viewerId ? await this.isFollowing(viewerId, user.id) : false;
    return this.buildProfileResponse(user, following);
  }

  async follow(followerId: number, target: string): Promise<ProfileResponseDto> {
    let targetUser = await this.findByEmail(target);
    if (!targetUser && !isNaN(Number(target))) {
      targetUser = await this.findOne(Number(target));
    }
    if (!targetUser) {
      throw new NotFoundException(this.i18n.t('users.USER_NOT_FOUND'));
    }
    if (targetUser.id === followerId) {
      throw new ConflictException(this.i18n.t('users.CANNOT_FOLLOW_YOURSELF'));
    }

    const alreadyFollowing = await this.isFollowing(followerId, targetUser.id);
    if (!alreadyFollowing) {
      await this.followsRepository.save(
        this.followsRepository.create({ followerId, followingId: targetUser.id }),
      );
    }

    return this.buildProfileResponse(targetUser, true);
  }

  async unfollow(followerId: number, target: string): Promise<ProfileResponseDto> {
    let targetUser = await this.findByEmail(target);
    if (!targetUser && !isNaN(Number(target))) {
      targetUser = await this.findOne(Number(target));
    }
    if (!targetUser) {
      throw new NotFoundException(this.i18n.t('users.USER_NOT_FOUND'));
    }

    await this.followsRepository.delete({ followerId, followingId: targetUser.id });

    return this.buildProfileResponse(targetUser, false);
  }
}
