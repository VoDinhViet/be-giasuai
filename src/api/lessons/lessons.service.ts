import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, asc, eq } from 'drizzle-orm';
import { plainToInstance } from 'class-transformer';

import { AllConfigType } from '../../config/config.type';
import { ErrorCode } from '../../constants/error-code.constant';
import { AppException } from '../../exceptions/app.exception';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.type';
import { lessonParts as lessonPartTable } from '../../database/schemas/lessons/lesson-parts';
import { lessons as lessonTable } from '../../database/schemas/lessons/lessons';
import { LessonDetailResDto } from './dto/lesson-detail.res.dto';
import { LessonPartResDto } from './dto/lesson-part.res.dto';

@Injectable()
export class LessonsService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async getLessonById(lessonId: string): Promise<LessonDetailResDto> {
    const lesson = await this.db.query.lessons.findFirst({
      where: eq(lessonTable.id, lessonId),
      with: {
        parts: {
          orderBy: asc(lessonPartTable.position),
        },
      },
    });

    if (!lesson) {
      throw new AppException(
        ErrorCode.E002,
        HttpStatus.NOT_FOUND,
        'Lesson not found',
      );
    }

    return plainToInstance(LessonDetailResDto, lesson);
  }

  async getLessonTheories(lessonId: string): Promise<LessonPartResDto[]> {
    const lesson = await this.db.query.lessons.findFirst({
      where: eq(lessonTable.id, lessonId),
      columns: {
        id: true,
      },
      with: {
        parts: {
          where: eq(lessonPartTable.type, 'TEXT'),
          orderBy: asc(lessonPartTable.position),
        },
      },
    });

    if (!lesson) {
      throw new AppException(
        ErrorCode.E002,
        HttpStatus.NOT_FOUND,
        'Lesson not found',
      );
    }

    return plainToInstance(LessonPartResDto, lesson.parts);
  }

  async updateLessonTheories(
    lessonId: string,
    files: Express.Multer.File[],
  ): Promise<LessonPartResDto[]> {
    const lesson = await this.db.query.lessons.findFirst({
      where: eq(lessonTable.id, lessonId),
      columns: {
        id: true,
      },
    });

    if (!lesson) {
      throw new AppException(
        ErrorCode.E002,
        HttpStatus.NOT_FOUND,
        'Lesson not found',
      );
    }

    const backendDomain = this.configService.get('app.backendDomain', {
      infer: true,
    });
    const port = this.configService.get('app.port', { infer: true });

    await this.db.transaction(async (tx) => {
      await tx
        .delete(lessonPartTable)
        .where(
          and(
            eq(lessonPartTable.lessonId, lessonId),
            eq(lessonPartTable.type, 'TEXT'),
          ),
        );

      if (files && files.length > 0) {
        const insertValues = files.map((file, index) => {
          const fileUrl = `${backendDomain}:${port}/uploads/${file.filename}`;

          return {
            lessonId,
            title: `Phần ${index + 1}`,
            type: 'TEXT' as const,
            fileUrl,
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            position: index + 1,
            isPublished: true,
          };
        });

        await tx.insert(lessonPartTable).values(insertValues);
      }
    });

    return this.getLessonTheories(lessonId);
  }
}
