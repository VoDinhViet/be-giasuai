import * as dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
dotenv.config(); // Fallback for .env

import {
  ClassSerializerInterceptor,
  HttpStatus,
  Logger,
  RequestMethod,
  UnprocessableEntityException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationError } from 'class-validator';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { setupSwagger } from './utils/swagger.util';
import { AllConfigType } from './config/config.type';
import { Environment } from './constants/app.constant';

export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(compression());

  const configService = app.get(ConfigService<AllConfigType>);

  app.enableCors({
    origin: configService.getOrThrow('app.corsOrigin', { infer: true }),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  const reflector = app.get(Reflector);

  app.setGlobalPrefix('api', {
    exclude: [
      { method: RequestMethod.GET, path: '/' },
      { method: RequestMethod.GET, path: 'health' },
    ],
  });
  app.enableVersioning({ type: VersioningType.URI });

  app.useGlobalFilters(new GlobalExceptionFilter(configService));
  app.useGlobalGuards(app.get(AuthGuard), app.get(RolesGuard));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors: ValidationError[]) =>
        new UnprocessableEntityException(errors),
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  if (
    configService.getOrThrow('app.nodeEnv', { infer: true }) !==
    Environment.PRODUCTION
  ) {
    setupSwagger(app);
  }

  await app.init();
  return app.getHttpAdapter().getInstance();
}

bootstrap().then(async (instance) => {
  const port = process.env.APP_PORT || 3000;
  instance.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/api`,
    'Bootstrap',
  );
});
