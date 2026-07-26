import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Follow } from './entities/follow.entity';
import { UrlHelperService } from '../common/services/url-helper.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Follow),
          useValue: { create: jest.fn(), save: jest.fn(), count: jest.fn(), delete: jest.fn() },
        },
        { provide: JwtService, useValue: { sign: jest.fn() } },
        { provide: I18nService, useValue: { t: jest.fn() } },
        {
          provide: UrlHelperService,
          useValue: {
            asset: jest.fn((path) => (path ? `http://localhost:3000/${path.replace(/^\/+/, '')}` : null)),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
