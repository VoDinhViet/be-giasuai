import { unlink } from 'fs/promises';
import { join } from 'path';

import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm';

import { OffsetPaginatedDto } from '../../common/offset-pagination/paginated.dto';
import { OffsetPaginationDto } from '../../common/offset-pagination/offset-pagination.dto';
import { PageOptionsDto } from '../../common/offset-pagination/page-options.dto';
import { OrderBy } from '../../constants/app.constant';
import { ErrorCode } from '../../constants/error-code.constant';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.type';
import {
  courseLessons,
  courseLessonParts,
  courseSections,
  courses,
} from '../../database/schemas';
import { AppException } from '../../exceptions/app.exception';

import { CourseDetailResDto } from './dto/course-detail.res.dto';
import { CourseLessonPartResDto } from './dto/course-lesson-detail.res.dto';
import { CourseSectionWithLessonsResDto } from './dto/course-section-with-lessons.res.dto';

import { CourseCurriculumResDto } from './dto/course-curriculum.res.dto';
import { CourseResDto } from './dto/course.res.dto';
import { CreateCourseReqDto } from './dto/create-course.req.dto';
import { PageCoursesReqDto } from './dto/page-courses.req.dto';
import { SyncCourseCurriculumReqDto } from './dto/sync-course-curriculum.req.dto';
import { UpdateCourseReqDto } from './dto/update-course.req.dto';

type CourseMutationDto = CreateCourseReqDto | UpdateCourseReqDto;

type CurriculumLessonPartInput = {
  title?: string;
  file?: string | null;
  fileUrl?: string | null;
  isPublished?: boolean;
};

type CurriculumLessonInput = {
  title?: string;
  durationMinutes?: number;
  isPreview?: boolean;
  isPublished?: boolean;
  lessonParts?: CurriculumLessonPartInput[];
};

type CurriculumSectionInput = {
  title?: string;
  description?: string | null;
  lessons?: CurriculumLessonInput[];
};

@Injectable()
export class CoursesService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) {}

  async createCourse(
    reqDto: CreateCourseReqDto,
    thumbnail?: Express.Multer.File,
  ): Promise<CourseDetailResDto> {
    const [course] = await this.db
      .insert(courses)
      .values({
        title: reqDto.title,
        slug: await this.buildUniqueSlug(reqDto.title),
        description: reqDto.description,
        thumbnailUrl: this.getUploadedFileUrl(thumbnail),
        tags: this.parseStringArray(reqDto.tags, 'tags'),
        learningOutcomes: this.parseStringArray(
          reqDto.learningOutcomes,
          'learningOutcomes',
        ),
        isPublished: reqDto.isPublished ?? false,
      })
      .returning();

    return plainToInstance(CourseDetailResDto, course);
  }

  async updateCourse(
    courseId: string,
    reqDto: UpdateCourseReqDto,
    thumbnail?: Express.Multer.File,
  ): Promise<CourseDetailResDto> {
    const course = await this.ensureCourseExists(courseId);
    const updatePayload = await this.buildCourseUpdatePayload(
      reqDto,
      courseId,
      thumbnail,
    );

    if (Object.keys(updatePayload).length === 0) {
      return plainToInstance(CourseDetailResDto, course);
    }

    const [updatedCourse] = await this.db
      .update(courses)
      .set(updatePayload)
      .where(eq(courses.id, courseId))
      .returning();

    if (thumbnail && course.thumbnailUrl) {
      await this.removeLocalFile(course.thumbnailUrl);
    }

    return plainToInstance(CourseDetailResDto, updatedCourse);
  }

  async deleteCourse(courseId: string): Promise<void> {
    const course = await this.db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      throw new AppException(
        ErrorCode.E105,
        'Course not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (course.thumbnailUrl) {
      await this.removeLocalFile(course.thumbnailUrl);
    }

    await this.db.delete(courses).where(eq(courses.id, courseId));
  }

  async getCourses(
    pageOptions: PageCoursesReqDto,
  ): Promise<OffsetPaginatedDto<CourseResDto>> {
    const where = and(
      pageOptions.q
        ? or(
            ilike(courses.title, `%${pageOptions.q}%`),
            ilike(courses.slug, `%${pageOptions.q}%`),
            ilike(courses.description, `%${pageOptions.q}%`),
          )
        : undefined,
      pageOptions.isPublished !== undefined
        ? eq(courses.isPublished, pageOptions.isPublished)
        : undefined,
    );

    const orderBy =
      pageOptions.order === OrderBy.DESC
        ? desc(courses.createdAt)
        : asc(courses.createdAt);

    const [rows, [{ total }]] = await Promise.all([
      this.db.query.courses.findMany({
        where,
        orderBy,
        limit: pageOptions.limit,
        offset: pageOptions.offset,
      }),
      this.db.select({ total: count() }).from(courses).where(where),
    ]);

    return new OffsetPaginatedDto(
      plainToInstance(CourseResDto, rows),
      new OffsetPaginationDto(total, pageOptions),
    );
  }

  async getCourseDetail(courseId: string): Promise<CourseDetailResDto> {
    const course = await this.db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      throw new AppException(
        ErrorCode.E105,
        'Course not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return plainToInstance(CourseDetailResDto, course);
  }

  async getCourseSections(
    courseId: string,
  ): Promise<CourseSectionWithLessonsResDto[]> {
    const courseWithSections = await this.db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      columns: {
        id: true,
      },
      with: {
        courseSections: {
          orderBy: [
            asc(courseSections.position),
            asc(courseSections.createdAt),
          ],
          with: {
            lessons: {
              orderBy: [
                asc(courseLessons.position),
                asc(courseLessons.createdAt),
              ],
            },
          },
        },
      },
    });

    if (!courseWithSections) {
      throw new AppException(
        ErrorCode.E105,
        'Course not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return plainToInstance(
      CourseSectionWithLessonsResDto,
      courseWithSections.courseSections,
    );
  }

  async getCourseCurriculum(
    courseId: string,
  ): Promise<CourseCurriculumResDto> {
    const courseWithSections = await this.getCourseWithCurriculum(courseId);

    return plainToInstance(CourseCurriculumResDto, {
      courseSections: this.mapCourseSectionsWithParts(courseWithSections),
    });
  }

  async syncCourseCurriculum(
    courseId: string,
    reqDto: SyncCourseCurriculumReqDto,
    files: Express.Multer.File[],
  ): Promise<CourseCurriculumResDto> {
    await this.ensureCourseExists(courseId);

    const sections = this.parseCurriculumSections(reqDto.courseSections);
    const fileMap = new Map(files.map((file) => [file.fieldname, file]));

    await this.db.transaction(async (tx) => {
      await tx.delete(courseSections).where(eq(courseSections.courseId, courseId));

      for (const [sectionIndex, sectionInput] of sections.entries()) {
        const sectionTitle = sectionInput.title?.trim();

        if (!sectionTitle) {
          continue;
        }

        const [section] = await tx
          .insert(courseSections)
          .values({
            courseId,
            title: sectionTitle,
            description: sectionInput.description,
            position: sectionIndex + 1,
          })
          .returning();

        for (const [lessonIndex, lessonInput] of (
          sectionInput.lessons ?? []
        ).entries()) {
          const lessonTitle = lessonInput.title?.trim();

          if (!lessonTitle) {
            continue;
          }

          const [lesson] = await tx
            .insert(courseLessons)
            .values({
              sectionId: section.id,
              title: lessonTitle,
              durationMinutes: this.toPositiveInt(
                lessonInput.durationMinutes,
                0,
              ),
              position: lessonIndex + 1,
              isPreview: lessonInput.isPreview ?? false,
              isPublished: lessonInput.isPublished ?? true,
            })
            .returning();

          for (const [partIndex, partInput] of (
            lessonInput.lessonParts ?? []
          ).entries()) {
            const lessonPart = this.resolveLessonPartInput(
              sectionIndex,
              lessonIndex,
              partIndex,
              partInput,
              fileMap,
            );

            if (!lessonPart) {
              continue;
            }

            await tx.insert(courseLessonParts).values({
              lessonId: lesson.id,
              title: lessonPart.title,
              partType: lessonPart.partType,
              fileUrl: lessonPart.fileUrl,
              position: partIndex + 1,
              isPublished: lessonPart.isPublished,
            });
          }
        }
      }
    });

    return this.getCourseCurriculum(courseId);
  }

  async getCourseLessonDetail(
    courseId: string,
    lessonId: string,
    pageOptions: PageOptionsDto,
  ): Promise<OffsetPaginatedDto<CourseLessonPartResDto>> {
    const course = await this.db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      columns: {
        id: true,
      },
      with: {
        courseSections: {
          with: {
            lessons: {
              columns: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new AppException(
        ErrorCode.E105,
        'Course not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const lesson = course.courseSections
      .flatMap((section) => section.lessons)
      .find((item) => item.id === lessonId);

    if (!lesson) {
      throw new AppException(
        ErrorCode.E105,
        'Lesson not found in course',
        HttpStatus.NOT_FOUND,
      );
    }

    const where = eq(courseLessonParts.lessonId, lessonId);
    const [lessonParts, [{ total }]] = await Promise.all([
      this.db
        .select({
          id: courseLessonParts.id,
          lessonId: courseLessonParts.lessonId,
          title: courseLessonParts.title,
          partType: courseLessonParts.partType,
          fileUrl: courseLessonParts.fileUrl,
          position: courseLessonParts.position,
          isPublished: courseLessonParts.isPublished,
        })
        .from(courseLessonParts)
        .where(where)
        .orderBy(
          asc(courseLessonParts.position),
          asc(courseLessonParts.createdAt),
        )
        .limit(pageOptions.limit)
        .offset(pageOptions.offset),
      this.db.select({ total: count() }).from(courseLessonParts).where(where),
    ]);

    return new OffsetPaginatedDto(
      plainToInstance(CourseLessonPartResDto, lessonParts),
      new OffsetPaginationDto(total, pageOptions),
    );
  }

  private async ensureCourseExists(courseId: string) {
    const course = await this.db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      throw new AppException(
        ErrorCode.E105,
        'Course not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return course;
  }

  private async getCourseWithCurriculum(courseId: string) {
    const courseWithSections = await this.db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      columns: {
        id: true,
      },
      with: {
        courseSections: {
          orderBy: [
            asc(courseSections.position),
            asc(courseSections.createdAt),
          ],
          with: {
            lessons: {
              orderBy: [
                asc(courseLessons.position),
                asc(courseLessons.createdAt),
              ],
              with: {
                courseLessonParts: {
                  orderBy: [
                    asc(courseLessonParts.position),
                    asc(courseLessonParts.createdAt),
                  ],
                },
              },
            },
          },
        },
      },
    });

    if (!courseWithSections) {
      throw new AppException(
        ErrorCode.E105,
        'Course not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return courseWithSections;
  }

  private mapCourseSectionsWithParts(
    courseWithSections: Awaited<
      ReturnType<CoursesService['getCourseWithCurriculum']>
    >,
  ) {
    return courseWithSections.courseSections.map((section) => ({
      ...section,
      lessons: section.lessons.map((lesson) => ({
        ...lesson,
        lessonParts: lesson.courseLessonParts,
      })),
    }));
  }

  private async buildCourseUpdatePayload(
    reqDto: UpdateCourseReqDto,
    courseId: string,
    thumbnail?: Express.Multer.File,
  ) {
    const updatePayload: Partial<typeof courses.$inferInsert> = {};

    if (reqDto.title !== undefined) {
      updatePayload.title = reqDto.title;
      updatePayload.slug = await this.buildUniqueSlug(reqDto.title, courseId);
    }

    if (reqDto.description !== undefined) {
      updatePayload.description = reqDto.description;
    }

    if (reqDto.tags !== undefined) {
      updatePayload.tags = this.parseStringArray(reqDto.tags, 'tags');
    }

    if (reqDto.learningOutcomes !== undefined) {
      updatePayload.learningOutcomes = this.parseStringArray(
        reqDto.learningOutcomes,
        'learningOutcomes',
      );
    }

    if (reqDto.isPublished !== undefined) {
      updatePayload.isPublished = reqDto.isPublished;
    }

    if (thumbnail) {
      updatePayload.thumbnailUrl = this.getUploadedFileUrl(thumbnail);
    }

    return updatePayload;
  }

  private async buildUniqueSlug(title: string, excludeCourseId?: string) {
    const baseSlug = this.slugify(title);

    for (let suffix = 0; suffix < 100; suffix += 1) {
      const slug = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`;
      const existingCourse = await this.db.query.courses.findFirst({
        where: eq(courses.slug, slug),
        columns: {
          id: true,
        },
      });

      if (!existingCourse || existingCourse.id === excludeCourseId) {
        return slug;
      }
    }

    throw new AppException(
      ErrorCode.E105,
      'Could not generate a unique course slug',
      HttpStatus.CONFLICT,
    );
  }

  private slugify(title: string) {
    const slug = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return slug || 'course';
  }

  private parseStringArray(value: CourseMutationDto['tags'], fieldName: string) {
    if (value === undefined || value === '') {
      return [];
    }

    try {
      const parsed = JSON.parse(value);

      if (!Array.isArray(parsed)) {
        throw new Error('Not an array');
      }

      return parsed
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean);
    } catch {
      throw new AppException(
        ErrorCode.V000,
        `${fieldName} must be a JSON array`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  private parseCurriculumSections(value: string): CurriculumSectionInput[] {
    try {
      const parsed = JSON.parse(value);

      if (!Array.isArray(parsed)) {
        throw new Error('Not an array');
      }

      return parsed as CurriculumSectionInput[];
    } catch {
      throw new AppException(
        ErrorCode.V000,
        'courseSections must be a JSON array',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  private resolveLessonPartInput(
    sectionIndex: number,
    lessonIndex: number,
    partIndex: number,
    partInput: CurriculumLessonPartInput,
    fileMap: Map<string, Express.Multer.File>,
  ) {
    const title = partInput.title?.trim();

    if (!title) {
      return null;
    }

    const uploadedFile = fileMap.get(
      `file_s${sectionIndex}_l${lessonIndex}_ss${partIndex}`,
    );
    const fileUrl =
      this.getUploadedFileUrl(uploadedFile) ||
      this.normalizeExistingFileUrl(partInput.fileUrl) ||
      this.normalizeExistingFileUrl(partInput.file);

    if (!fileUrl) {
      return null;
    }

    return {
      title,
      fileUrl,
      partType: this.resolveLessonPartType(fileUrl),
      isPublished: partInput.isPublished ?? true,
    };
  }

  private getUploadedFileUrl(file?: Express.Multer.File) {
    return file ? `uploads/${file.filename}` : undefined;
  }

  private normalizeExistingFileUrl(value?: string | null) {
    const fileUrl = typeof value === 'string' ? value.trim() : '';

    return fileUrl || undefined;
  }

  private resolveLessonPartType(fileUrl: string): 'PDF' | 'DOCX' {
    return fileUrl.toLowerCase().endsWith('.docx') ? 'DOCX' : 'PDF';
  }

  private toPositiveInt(value: unknown, fallback: number) {
    const numberValue = Number(value);

    return Number.isInteger(numberValue) && numberValue >= 0
      ? numberValue
      : fallback;
  }

  private async removeLocalFile(fileUrl: string) {
    if (fileUrl.startsWith('http')) {
      return;
    }

    const filePath = join(process.cwd(), fileUrl);
    try {
      await unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete local file: ${filePath}`, error);
    }
  }
}
