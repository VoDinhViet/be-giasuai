import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import databaseConfig from './database/config/database.config';
import authConfig from './api/auth/config/auth.config';
import redisConfig from './redis/redis.config';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './api/auth/auth.module';
import { ClassesModule } from './api/classes/classes.module';
import { UsersModule } from './api/users/users.module';
import { CoursesModule } from './api/courses/courses.module';
import { FilesModule } from './api/files/files.module';
import { AcademicCatalogModule } from './api/academic-catalog/academic-catalog.module';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig, databaseConfig, authConfig, redisConfig],
      isGlobal: true,
    }),

    DatabaseModule,
    RedisModule,
    AuthModule,
    ClassesModule,
    UsersModule,
    CoursesModule,
    FilesModule,
    AcademicCatalogModule,
  ],
  controllers: [AppController],
  providers: [AppService, RolesGuard],
})
export class AppModule {}
