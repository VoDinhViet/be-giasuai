import { randomBytes } from 'crypto';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { extname, join } from 'path';

import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm';

import { OffsetPaginatedDto } from '../../common/offset-pagination/paginated.dto';
import { OffsetPaginationDto } from '../../common/offset-pagination/offset-pagination.dto';
import { OrderBy } from '../../constants/app.constant';
import { ErrorCode } from '../../constants/error-code.constant';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.type';
import {
  courseSections,
  courses,
  lessons,
  lessonParts,
  categories,
} from '../../database/schemas';
import { AppException } from '../../exceptions/app.exception';

import { CourseDetailResDto } from './dto/course-detail.res.dto';
import { CourseCurriculumResDto } from './dto/course-curriculum.res.dto';
import { CourseDetailLessonResDto } from './dto/course-detail-lesson.res.dto';
import { CourseDetailSectionResDto } from './dto/course-detail-section.res.dto';

import { CourseResDto } from './dto/course.res.dto';
import { CreateCourseReqDto } from './dto/create-course.req.dto';
import { GetCoursesReqDto } from './dto/get-courses.req.dto';
import {
  UpdateCourseCurriculumReqDto,
  UpdateCourseLessonPartReqDto,
  UpdateCourseLessonReqDto,
  UpdateCourseSectionReqDto,
} from './dto/update-course-curriculum.req.dto';
import { UpdateCourseReqDto } from './dto/update-course.req.dto';
import { SimulationType } from './dto/simulation-type.enum';

@Injectable()
export class CoursesService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) {}

  async createCourse(
    dto: CreateCourseReqDto,
    thumbnail?: Express.Multer.File,
  ): Promise<CourseResDto> {
    const slug = await this.generateUniqueSlug(dto.title);

    const [createdCourse] = await this.db
      .insert(courses)
      .values({
        title: dto.title,
        description: dto.description,
        slug,
        thumbnailUrl: dto.thumbnailUrl,
        tags: dto.tags,
        learningOutcomes: dto.learningOutcomes,
        levelId: dto.levelId,
        gradeId: dto.gradeId,
        majorId: dto.majorId,
        subjectId: dto.subjectId,
      })
      .returning();

    if (!thumbnail) {
      return plainToInstance(CourseResDto, createdCourse);
    }

    const thumbnailUrl = await this.uploadThumbnail(thumbnail, slug);
    const [updatedCourse] = await this.db
      .update(courses)
      .set({ thumbnailUrl })
      .where(eq(courses.id, createdCourse.id))
      .returning();

    return plainToInstance(CourseResDto, updatedCourse);
  }

  async updateCourse(
    courseId: string,
    dto: UpdateCourseReqDto,
    thumbnail?: Express.Multer.File,
  ): Promise<void> {
    const course = await this.validateCourseExists(this.db, courseId);

    const updateData: any = {
      title: dto.title,
      description: dto.description,
      thumbnailUrl: dto.thumbnailUrl,
      tags: dto.tags,
      learningOutcomes: dto.learningOutcomes,
      levelId: dto.levelId,
      gradeId: dto.gradeId,
      majorId: dto.majorId,
      subjectId: dto.subjectId,
    };

    if (dto.title) {
      updateData.slug = await this.generateUniqueSlug(dto.title);
    }

    if (thumbnail) {
      // Delete old thumbnail if exists
      if (course.thumbnailUrl) {
        const oldPath = join(process.cwd(), course.thumbnailUrl);
        try {
          await unlink(oldPath);
        } catch (error) {
          console.error(`Failed to delete old thumbnail: ${oldPath}`, error);
        }
      }
      updateData.thumbnailUrl = await this.uploadThumbnail(
        thumbnail,
        updateData.slug || course.slug,
      );
    }

    await this.db
      .update(courses)
      .set(updateData)
      .where(eq(courses.id, courseId));
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

    // Delete thumbnail file if exists
    if (course.thumbnailUrl) {
      const filePath = join(process.cwd(), course.thumbnailUrl);
      try {
        await unlink(filePath);
      } catch (error) {
        // Log error but don't stop deletion if file missing
        console.error(`Failed to delete thumbnail file: ${filePath}`, error);
      }
    }

    await this.db.delete(courses).where(eq(courses.id, courseId));
  }

  async syncCurriculum(
    courseId: string,
    reqDto: UpdateCourseCurriculumReqDto,
    files: Express.Multer.File[],
  ): Promise<void> {
    const sections = reqDto.courseSections;
    const logger = new Logger('CoursesService');

    if (!Array.isArray(sections)) {
      throw new AppException(
        ErrorCode.E105,
        'Curriculum sections must be an array',
        HttpStatus.BAD_REQUEST,
      );
    }

    logger.log(`[SYNC START] Course: ${courseId} | Sections: ${sections.length}`);

    await this.db.transaction(async (tx) => {
      const course = await this.validateCourseExists(tx, courseId);

      // Clear existing curriculum (Cascade delete handles lessons and parts)
      logger.log(`  [CLEAN] Removing old curriculum for course ${courseId}...`);
      await tx
        .delete(courseSections)
        .where(eq(courseSections.courseId, courseId));

      // Re-insert curriculum tree
      for (let sIdx = 0; sIdx < sections.length; sIdx++) {
        logger.log(`  [SECTION ${sIdx + 1}/${sections.length}] Processing: ${sections[sIdx].title}`);
        await this.processSection(
          tx,
          courseId,
          sections[sIdx],
          sIdx,
          files,
          course.slug,
        );
      }
    });

    logger.log(`[SYNC SUCCESS] Course: ${courseId}`);
  }

  private async validateCourseExists(tx: Database, courseId: string) {
    const course = await tx.query.courses.findFirst({
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

  private async processSection(
    tx: Database,
    courseId: string,
    sectionDto: UpdateCourseSectionReqDto,
    sIdx: number,
    files: Express.Multer.File[],
    courseSlug: string,
  ) {
    if (!sectionDto.title) {
      console.error(`Missing title for section at index ${sIdx}`, sectionDto);
      throw new AppException(
        ErrorCode.E105,
        `Missing title for section ${sIdx + 1}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const [section] = await tx
      .insert(courseSections)
      .values({
        courseId,
        title: sectionDto.title,
        position: sIdx + 1,
      })
      .returning();

    const lessonsCount = sectionDto.lessons?.length || 0;
    for (let lIdx = 0; lIdx < lessonsCount; lIdx++) {
      const lessonDto = sectionDto.lessons![lIdx];
      console.log(`    └─ [LESSON ${lIdx + 1}/${lessonsCount}] ${lessonDto.title}`);
      await this.processLesson(
        tx,
        section.id,
        lessonDto,
        sIdx,
        lIdx,
        files,
        courseSlug,
      );
    }
  }

  private async processLesson(
    tx: Database,
    sectionId: string,
    lessonDto: UpdateCourseLessonReqDto,
    sIdx: number,
    lIdx: number,
    files: Express.Multer.File[],
    courseSlug: string,
  ) {
    const [lesson] = await tx
      .insert(lessons)
      .values({
        sectionId,
        title: lessonDto.title,
        position: lIdx + 1,
      })
      .returning();

    const lessonPartsCount = lessonDto.lessonParts?.length || 0;
    for (let ssIdx = 0; ssIdx < lessonPartsCount; ssIdx++) {
      const lessonPartDto = lessonDto.lessonParts![ssIdx];
      console.log(`        └─ [LESSON PART ${ssIdx + 1}/${lessonPartsCount}] ${lessonPartDto.title}`);
      await this.processLessonPart(
        tx,
        lesson.id,
        lessonPartDto,
        sIdx,
        lIdx,
        ssIdx,
        files,
        courseSlug,
      );
    }
  }

  private async processLessonPart(
    tx: Database,
    lessonId: string,
    lessonPartDto: UpdateCourseLessonPartReqDto,
    sIdx: number,
    lIdx: number,
    ssIdx: number,
    files: Express.Multer.File[],
    courseSlug: string,
  ) {
    const fileKey = `file_s${sIdx}_l${lIdx}_ss${ssIdx}`;
    const file = files?.find((f) => f.fieldname === fileKey);
    console.log('File: ', file);

    let fileUrl = '';
    let partType: 'PDF' | 'DOCX' = 'PDF';

    if (file) {
      fileUrl = await this.saveLessonPartFile(file, courseSlug);
      partType = file.originalname.toLowerCase().endsWith('.docx')
        ? 'DOCX'
        : 'PDF';
    } else if (typeof lessonPartDto.file === 'string') {
      fileUrl = lessonPartDto.file;
      partType = fileUrl.toLowerCase().endsWith('.docx') ? 'DOCX' : 'PDF';
    }

    if (fileUrl) {
      await tx.insert(lessonParts).values({
        lessonId,
        title: lessonPartDto.title,
        fileUrl,
        partType,
        position: ssIdx + 1,
      });
    }
  }

  private async saveLessonPartFile(
    file: Express.Multer.File,
    slug: string,
  ): Promise<string> {
    const uploadDir = join(process.cwd(), 'uploads', 'lessons');
    await mkdir(uploadDir, { recursive: true });

    const filename = this.buildFileName('lesson-doc', slug, file.originalname);
    const filePath = join(uploadDir, filename);

    await writeFile(filePath, file.buffer);

    return `/uploads/lessons/${filename}`;
  }

  async getCourses(
    pageOptions: GetCoursesReqDto,
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

  async getCourseCurriculum(
    courseId: string,
  ): Promise<CourseDetailSectionResDto[]> {
    const courseWithCurriculum = await this.db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        courseSections: {
          orderBy: [asc(courseSections.position), asc(courseSections.createdAt)],
          with: {
            lessons: {
              orderBy: [asc(lessons.position), asc(lessons.createdAt)],
              with: {
                lessonParts: {
                  orderBy: [
                    asc(lessonParts.position),
                    asc(lessonParts.createdAt),
                  ],
                },
              },
            },
          },
        },
      },
    });

    if (!courseWithCurriculum) {
      throw new AppException(
        ErrorCode.E105,
        'Course not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return plainToInstance(
      CourseDetailSectionResDto,
      courseWithCurriculum.courseSections,
    );
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = this.slugify(name);
    let slug = baseSlug;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const existingCourse = await this.db.query.courses.findFirst({
        where: eq(courses.slug, slug),
        columns: { id: true },
      });

      if (!existingCourse) {
        return slug;
      }

      slug = `${baseSlug}-${randomBytes(3).toString('hex')}`;
    }

    return `${baseSlug}-${Date.now()}`;
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  private async uploadThumbnail(
    thumbnail: Express.Multer.File,
    slug: string,
  ): Promise<string> {
    console.log('thumbnail', thumbnail)
    const uploadDir = join(process.cwd(), 'uploads');
    const filename = this.buildFileName('course-thumb', slug, thumbnail.originalname);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), thumbnail.buffer);

    return `/uploads/${filename}`;
  }

  private buildFileName(prefix: string, slug: string, originalName: string): string {
    const random = randomBytes(4).toString('hex');
    const ext = extname(originalName).toLowerCase();
    return `${prefix}-${slug}-${random}${ext}`;
  }
}
