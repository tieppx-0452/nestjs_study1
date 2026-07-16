import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Follow } from './entities/follow.entity';
import { RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserFieldsDto } from './dto/update-user.dto';

const SALT_ROUNDS = 10;

export function toUserResponse(user: User, token: string) {
  return {
    user: {
      email: user.email,
      token,
      username: user.username,
      bio: user.bio,
      image: user.image,
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
    private readonly i18n: I18nService,
  ) {}

  async create(registerUserDto: RegisterUserDto): Promise<User> {
    const password = await bcrypt.hash(registerUserDto.password, SALT_ROUNDS);
    const user = this.usersRepository.create({ ...registerUserDto, password });

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(this.i18n.t('users.USERNAME_OR_EMAIL_EXISTS'));
      }
      throw error;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserFieldsDto): Promise<User> {
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

    return (await this.usersRepository.findOneBy({ id }))!;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const count = await this.followsRepository.count({
      where: { followerId, followingId },
    });
    return count > 0;
  }

  async follow(followerId: number, targetUsername: string): Promise<User> {
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

    return target;
  }

  async unfollow(followerId: number, targetUsername: string): Promise<User> {
    const target = await this.findByUsername(targetUsername);
    if (!target) {
      throw new NotFoundException(this.i18n.t('users.USER_NOT_FOUND'));
    }

    await this.followsRepository.delete({ followerId, followingId: target.id });

    return target;
  }
}
