import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { i18nValidationErrorFactory, I18nValidationExceptionFilter } from 'nestjs-i18n';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { existsSync, mkdirSync, chmodSync } from 'fs';

async function bootstrap() {
  const uploadsDir = join(process.cwd(), 'uploads');
  const avatarsDir = join(uploadsDir, 'avatars');
  if (!existsSync(avatarsDir)) {
    mkdirSync(avatarsDir, { recursive: true, mode: 0o755 });
  } else {
    try {
      chmodSync(avatarsDir, 0o755);
    } catch (e) {}
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });

  await app.register(fastifyStatic, {
    root: uploadsDir,
    prefix: '/uploads/',
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: i18nValidationErrorFactory,
    }),
  );
  app.useGlobalFilters(new I18nValidationExceptionFilter({ detailedErrors: false }));
  // app.useGlobalInterceptors(new ResponseInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
