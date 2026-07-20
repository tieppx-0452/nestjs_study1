import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/entities/user.entity';
import { Follow } from '../src/users/entities/follow.entity';
import { i18nValidationErrorFactory, I18nValidationExceptionFilter } from 'nestjs-i18n';

describe('Users Module (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let initialUser: User;
  let initialUserToken: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        exceptionFactory: i18nValidationErrorFactory,
      }),
    );
    app.useGlobalFilters(new I18nValidationExceptionFilter({ detailedErrors: false }));

    await app.init();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    // 1. Reset Database before each test case
    await dataSource.synchronize(true);

    // 2. Seed Fake Data
    const userRepository = dataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    initialUser = userRepository.create({
      email: 'seeduser@example.com',
      username: 'seeduser',
      password: hashedPassword,
      bio: 'Initial seed user bio',
      image: 'https://example.com/avatar.jpg',
    });
    await userRepository.save(initialUser);

    // 3. Obtain auth token for initial user via login
    const loginRes = await request(app.getHttpServer())
      .post('/api/users/login')
      .send({
        user: {
          email: 'seeduser@example.com',
          password: 'Password123!',
        },
      });

    initialUserToken = loginRes.body.user?.token;
  });

  describe('POST /api/users (Register)', () => {
    it('should register a new user successfully and return user response with JWT token', async () => {
      const newUserPayload = {
        user: {
          email: 'newuser@example.com',
          username: 'newuser',
          password: 'NewUserPass123!',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send(newUserPayload)
        .expect(201);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.user.username).toBe('newuser');
      expect(response.body.user.token).toBeDefined();

      // Verify record is created in E2E database
      const dbUser = await dataSource
        .getRepository(User)
        .findOneBy({ email: 'newuser@example.com' });
      expect(dbUser).toBeDefined();
      expect(dbUser?.username).toBe('newuser');
    });

    it('should return 409 Conflict if email or username already exists', async () => {
      const duplicatePayload = {
        user: {
          email: 'seeduser@example.com',
          username: 'seeduser',
          password: 'Password123!',
        },
      };

      await request(app.getHttpServer())
        .post('/api/users')
        .send(duplicatePayload)
        .expect(409);
    });
  });

  describe('POST /api/users/login (Login)', () => {
    it('should authenticate user and return JWT access token', async () => {
      const loginPayload = {
        user: {
          email: 'seeduser@example.com',
          password: 'Password123!',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send(loginPayload)
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('seeduser@example.com');
      expect(response.body.user.token).toBeDefined();
    });

    it('should return 401 Unauthorized for invalid credentials', async () => {
      const invalidPayload = {
        user: {
          email: 'seeduser@example.com',
          password: 'WrongPassword!',
        },
      };

      await request(app.getHttpServer())
        .post('/api/users/login')
        .send(invalidPayload)
        .expect(401);
    });
  });

  describe('GET /api/users/:id (Find One User)', () => {
    it('should return user info when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${initialUser.id}`)
        .set('Authorization', `Bearer ${initialUserToken}`)
        .expect(200);

      expect(response.body.id).toBe(initialUser.id);
      expect(response.body.username).toBe('seeduser');
    });

    it('should return 401 Unauthorized without JWT token', async () => {
      await request(app.getHttpServer())
        .get(`/api/users/${initialUser.id}`)
        .expect(401);
    });
  });

  describe('PATCH /api/users/:id (Update User)', () => {
    it('should update user profile successfully', async () => {
      const updatePayload = {
        user: {
          bio: 'Updated bio in E2E test',
          image: 'https://example.com/new-avatar.jpg',
        },
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/users/${initialUser.id}`)
        .set('Authorization', `Bearer ${initialUserToken}`)
        .send(updatePayload)
        .expect(200);

      expect(response.body.user.bio).toBe('Updated bio in E2E test');

      // Verify updated in database
      const updatedUserInDb = await dataSource
        .getRepository(User)
        .findOneBy({ id: initialUser.id });
      expect(updatedUserInDb?.bio).toBe('Updated bio in E2E test');
      expect(updatedUserInDb?.image).toBe('https://example.com/new-avatar.jpg');
    });
  });

  describe('GET /api/profiles/:username & Follow / Unfollow Flow', () => {
    it('should fetch profile, follow and unfollow target user', async () => {
      // Create a target user to follow
      const userRepository = dataSource.getRepository(User);
      const targetUser = await userRepository.save(
        userRepository.create({
          email: 'target@example.com',
          username: 'targetuser',
          password: 'Password123!',
        }),
      );

      // 1. Get profile before following
      const getProfileRes = await request(app.getHttpServer())
        .get('/api/profiles/targetuser')
        .set('Authorization', `Bearer ${initialUserToken}`)
        .expect(200);

      expect(getProfileRes.body.profile.username).toBe('targetuser');
      expect(getProfileRes.body.profile.following).toBe(false);

      // 2. Follow target user
      const followRes = await request(app.getHttpServer())
        .post('/api/profiles/targetuser/follow')
        .set('Authorization', `Bearer ${initialUserToken}`)
        .expect(201);

      expect(followRes.body.profile.following).toBe(true);

      // Verify follow relation in database
      const followRecord = await dataSource.getRepository(Follow).findOneBy({
        followerId: initialUser.id,
        followingId: targetUser.id,
      });
      expect(followRecord).toBeDefined();

      // 3. Unfollow target user
      const unfollowRes = await request(app.getHttpServer())
        .delete('/api/profiles/targetuser/follow')
        .set('Authorization', `Bearer ${initialUserToken}`)
        .expect(200);

      expect(unfollowRes.body.profile.following).toBe(false);
    });
  });

  describe('DELETE /api/users/:id (Remove User)', () => {
    it('should delete user successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${initialUser.id}`)
        .set('Authorization', `Bearer ${initialUserToken}`)
        .expect(200);

      // Verify deleted in DB
      const dbUser = await dataSource
        .getRepository(User)
        .findOneBy({ id: initialUser.id });
      expect(dbUser).toBeNull();
    });
  });
});
