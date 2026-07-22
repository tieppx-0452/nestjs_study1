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
import { buildSelfUrl } from '../common/utils/url.util';

const SALT_ROUNDS = 10;

export function toUserResponse(user: User, token: string, baseUrl?: string) {
  return {
    user: {
      email: user.email,
      token,
      username: user.username,
      bio: user.bio,
      image: buildSelfUrl(user.image, baseUrl),
      imageOriginalName: user.imageOriginalName ?? null,
      imageMimeType: user.imageMimeType ?? null,
      imageSize: user.imageSize ?? null,
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
  ) {}

  private buildAuthResponse(user: User, baseUrl?: string) {
    const token = this.jwtService.sign({ username: user.username, sub: user.id });
    return toUserResponse(user, token, baseUrl);
  }

  login(user: User, baseUrl?: string) {
    return this.buildAuthResponse(user, baseUrl);
  }

  async getCurrentUser(id: number, baseUrl?: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.buildAuthResponse(user, baseUrl);
  }

  async create(registerUserDto: RegisterUserDto, baseUrl?: string) {
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

    return this.buildAuthResponse(saved, baseUrl);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findAll(baseUrl?: string) {
    const users = await this.usersRepository.find();
    return users.map((user) => ({
      ...user,
      image: buildSelfUrl(user.image, baseUrl),
    }));
  }

  async findOne(id: number, baseUrl?: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) return null;
    return {
      ...user,
      image: buildSelfUrl(user.image, baseUrl) as string,
    };
  }

  async update(id: number, updateUserDto: UpdateUserFieldsDto, baseUrl?: string) {
    const { password, ...rest } = updateUserDto;
    const data: Partial<User> = { ...rest };
    if (password) {
      data.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    try {
      await this.usersRepository.update(id, data);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(this.i18n.t('users.USERNAME_OR_EMAIL_EXISTS'));
      }
      throw error;
    }

    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(this.i18n.t('users.USER_NOT_FOUND'));
    }

    return this.buildAuthResponse(user, baseUrl);
  }

  async updateAvatar(
    userId: number,
    fileInfo: {
      relativePath: string;
      originalName: string;
      mimeType: string;
      size: number;
    },
    baseUrl?: string,
  ) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(this.i18n.t('users.USER_NOT_FOUND'));
    }

    if (user.image && user.image.startsWith('uploads/')) {
      const oldPath = join(process.cwd(), user.image);
      if (existsSync(oldPath)) {
        try {
          unlinkSync(oldPath);
        } catch (e) {}
      }
    }

    user.image = fileInfo.relativePath;
    user.imageOriginalName = fileInfo.originalName;
    user.imageMimeType = fileInfo.mimeType;
    user.imageSize = fileInfo.size;

    await this.usersRepository.save(user);

    return this.buildAuthResponse(user, baseUrl);
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

  async getProfile(username: string, viewerId?: number, baseUrl?: string): Promise<ProfileResponseDto> {
    const user = await this.findByUsername(username);
    if (!user) {
      throw new NotFoundException(this.i18n.t('users.USER_NOT_FOUND'));
    }

    const following = viewerId ? await this.isFollowing(viewerId, user.id) : false;
    return new ProfileResponseDto(user, following, baseUrl);
  }

  async follow(followerId: number, targetUsername: string, baseUrl?: string): Promise<ProfileResponseDto> {
    const target = await this.findByUsername(targetUsername);
    if (!target) {
      throw new NotFoundException(this.i18n.t('users.USER_NOT_FOUND'));
    }
    if (target.id === followerId) {
      throw new ConflictException(this.i18n.t('users.CANNOT_FOLLOW_YOURSELF'));
    }

    const alreadyFollowing = await this.isFollowing(followerId, target.id);
    if (!alreadyFollowing) {
      await this.followsRepository.save(
        this.followsRepository.create({ followerId, followingId: target.id }),
      );
    }

    return new ProfileResponseDto(target, true, baseUrl);
  }

  async unfollow(followerId: number, targetUsername: string, baseUrl?: string): Promise<ProfileResponseDto> {
    const target = await this.findByUsername(targetUsername);
    if (!target) {
      throw new NotFoundException(this.i18n.t('users.USER_NOT_FOUND'));
    }

    await this.followsRepository.delete({ followerId, followingId: target.id });

    return new ProfileResponseDto(target, false, baseUrl);
  }
}
