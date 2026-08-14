import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { UsersService } from './users.service';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let usersServiceMock: any;

  beforeEach(async () => {
    usersServiceMock = {
      findOne: jest.fn(),
      getProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [{ provide: UsersService, useValue: usersServiceMock }],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyProfile', () => {
    it('should return profile for logged in user', async () => {
      const mockUser = { id: 1, email: 'user1@example.com', name: 'User 1' };
      usersServiceMock.findOne.mockResolvedValue(mockUser);

      const req = { user: { userId: 1 } };
      const result = await controller.getMyProfile(req);

      expect(usersServiceMock.findOne).toHaveBeenCalledWith(1);
      expect(result.code).toEqual(200);
      expect(result.data).toEqual(mockUser);
    });
  });

  describe('getProfile', () => {
    it('should return public profile by username', async () => {
      const mockProfile = { username: 'testuser', email: 'test@example.com' };
      usersServiceMock.getProfile.mockResolvedValue(mockProfile);

      const req = { user: { userId: 1 } };
      const result = await controller.getProfile('testuser', req);

      expect(usersServiceMock.getProfile).toHaveBeenCalledWith('testuser', 1);
      expect(result).toEqual(mockProfile);
    });
  });
});
