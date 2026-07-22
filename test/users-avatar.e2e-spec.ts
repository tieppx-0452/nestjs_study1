import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import request from 'supertest';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as fs from 'fs';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/entities/user.entity';

describe('User Avatar Upload (e2e)', () => {
  jest.setTimeout(60000);

  let app: INestApplication;
  let dataSource: DataSource;
  let seedUser: User;
  let token: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    await app.register(fastifyMultipart, {
      limits: { fileSize: 5 * 1024 * 1024 },
    });

    await app.register(fastifyStatic, {
      root: uploadsDir,
      prefix: '/uploads/',
    });

    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

    await app.listen(0);
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
    const userRepository = dataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    seedUser = await userRepository.save(
      userRepository.create({
        email: 'avataruser@example.com',
        username: 'avataruser',
        password: hashedPassword,
      }),
    );

    const loginRes = await request(app.getHttpServer())
      .post('/api/users/login')
      .send({
        user: {
          email: 'avataruser@example.com',
          password: 'Password123!',
        },
      });

    token = loginRes.body.user.token;
  });

  it('should upload user avatar, store metadata in DB, and return self URL', async () => {
    const testImageBuffer = Buffer.from('fake-image-content');
    const testFileName = 'test-avatar.png';

    const uploadRes = await request(app.getHttpServer())
      .post('/api/users/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', testImageBuffer, testFileName)
      .expect(201);

    expect(uploadRes.body.user).toBeDefined();
    expect(uploadRes.body.user.image).toMatch(/\/uploads\/avatars\/.*\.png$/);
    expect(uploadRes.body.user.imageOriginalName).toBe('test-avatar.png');
    expect(uploadRes.body.user.imageMimeType).toBe('image/png');
    expect(uploadRes.body.user.imageSize).toBe(testImageBuffer.length);

    // Verify DB
    const dbUser = await dataSource.getRepository(User).findOneBy({ id: seedUser.id });
    expect(dbUser).toBeDefined();
    expect(dbUser?.image).toMatch(/^uploads\/avatars\/.*\.png$/);
    expect(dbUser?.imageOriginalName).toBe('test-avatar.png');
    expect(dbUser?.imageMimeType).toBe('image/png');
    expect(dbUser?.imageSize).toBe(testImageBuffer.length);

    // Verify File on Disk
    const filePath = path.join(process.cwd(), dbUser!.image!);
    expect(fs.existsSync(filePath)).toBe(true);

    // Verify GET /api/user returns self URL
    const getUserRes = await request(app.getHttpServer())
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getUserRes.body.user.image).toBe(uploadRes.body.user.image);

    // Verify GET /api/users/:id returns self URL
    const findOneRes = await request(app.getHttpServer())
      .get(`/api/users/${seedUser.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(findOneRes.body.image).toBe(uploadRes.body.user.image);

    // Verify GET /api/profiles/:username returns self URL
    const profileRes = await request(app.getHttpServer())
      .get(`/api/profiles/${seedUser.username}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(profileRes.body.profile.image).toBe(uploadRes.body.user.image);

    // Verify static file serving
    const imageUri = uploadRes.body.user.image;
    const urlPath = imageUri.startsWith('http') ? new URL(imageUri).pathname : imageUri;
    const staticRes = await request(app.getHttpServer())
      .get(urlPath)
      .expect(200);

    expect((staticRes.body && staticRes.body.length ? staticRes.body.toString() : staticRes.text)).toBe('fake-image-content');
  });
});
