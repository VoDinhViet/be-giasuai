import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { plainToInstance } from 'class-transformer';

import { CourseListItemResDto } from './dto/course-list-item.res.dto';
import { CourseResDto } from './dto/course.res.dto';
import { CourseStatsResDto } from './dto/course-stats.res.dto';
import {
  CreateCourseChapterReqDto,
  CreateCourseLessonReqDto,
  CreateCourseReqDto,
} from './dto/create-course.req.dto';
import { GetCoursesDto } from './dto/get-courses.dto';
import { UpdateCourseReqDto } from './dto/update-course.req.dto';
import type {
  ChapterInsertRow,
  CourseCreateTx,
  CreatedCourse,
  LessonInsertRow,
} from './types/course.types';
import { OrderBy } from '../../constants/app.constant';
import { AppException } from '../../exceptions/app.exception';
import { ErrorCode } from '../../constants/error-code.constant';
import { OffsetPaginatedDto } from '../../common/offset-pagination/paginated.dto';
import { OffsetPaginationDto } from '../../common/offset-pagination/offset-pagination.dto';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.type';
import { courseChapters } from '../../database/schemas/courses/course-chapters';
import { courseEnrollments } from '../../database/schemas/courses/course-enrollments';
import { courseLessons } from '../../database/schemas/courses/course-lessons';
import { courses } from '../../database/schemas/courses/courses';
import { users } from '../../database/schemas/users';

@Injectable()
export class CoursesService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) {}

  async getCourseByCode(courseCode: string): Promise<CourseResDto> {
    const [course] = await this.db
      .select({
        id: courses.id,
        code: courses.code,
        name: courses.name,
        category: courses.category,
        authorId: courses.authorId,
        authorName: users.fullName,
        description: courses.description,
        audience: courses.audience,
        level: courses.level,
        durationMinutes: courses.durationMinutes,
        startDate: courses.startDate,
        status: courses.status,
      })
      .from(courses)
      .leftJoin(users, eq(users.id, courses.authorId))
      .where(eq(courses.code, courseCode))
      .limit(1);

    if (!course) {
      throw new AppException(
        ErrorCode.E002,
        HttpStatus.NOT_FOUND,
        'Course not found',
      );
    }

    return plainToInstance(CourseResDto, course);
  }

  async getCourses(
    pageOptions: GetCoursesDto,
  ): Promise<OffsetPaginatedDto<CourseListItemResDto>> {
    const conditions: SQL[] = [];

    if (pageOptions.q) {
      const q = or(
        ilike(courses.code, `%${pageOptions.q}%`),
        ilike(courses.name, `%${pageOptions.q}%`),
        ilike(courses.category, `%${pageOptions.q}%`),
      );

      if (q) conditions.push(q);
    }

    if (pageOptions.status) {
      conditions.push(eq(courses.status, pageOptions.status));
    }

    if (pageOptions.category) {
      conditions.push(eq(courses.category, pageOptions.category));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const orderBy =
      pageOptions.order === OrderBy.ASC
        ? asc(courses.createdAt)
        : desc(courses.createdAt);

    const courseRowsQuery = this.db
      .select({
        id: courses.id,
        code: courses.code,
        name: courses.name,
        category: courses.category,
        authorName: users.fullName,
        learnerCount: sql<number>`count(distinct ${courseEnrollments.id})`,
        lessonCount: sql<number>`count(distinct ${courseLessons.id})`,
        durationMinutes: courses.durationMinutes,
        startDate: courses.startDate,
        status: courses.status,
      })
      .from(courses)
      .leftJoin(users, eq(users.id, courses.authorId))
      .leftJoin(courseEnrollments, eq(courseEnrollments.courseId, courses.id))
      .leftJoin(courseLessons, eq(courseLessons.courseId, courses.id))
      .where(where)
      .groupBy(courses.id, users.fullName)
      .orderBy(orderBy)
      .limit(pageOptions.limit)
      .offset(pageOptions.offset);

    const [courseRows, [{ total }]] = await Promise.all([
      courseRowsQuery,
      this.db.select({ total: count() }).from(courses).where(where),
    ]);

    const data = courseRows.map((course) => ({
      ...course,
      learnerCount: Number(course.learnerCount),
      lessonCount: Number(course.lessonCount),
    }));

    return new OffsetPaginatedDto(
      plainToInstance(CourseListItemResDto, data),
      new OffsetPaginationDto(total, pageOptions),
    );
  }

  async getStats(): Promise<CourseStatsResDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const next30Days = new Date(today);
    next30Days.setDate(next30Days.getDate() + 30);

    const [
      [{ total }],
      [{ published }],
      [{ enrolledLearners }],
      [{ totalDurationMinutes }],
      [{ upcomingStartCount }],
    ] = await Promise.all([
      this.db.select({ total: count() }).from(courses),
      this.db
        .select({ published: count() })
        .from(courses)
        .where(eq(courses.status, 'PUBLISHED')),
      this.db.select({ enrolledLearners: count() }).from(courseEnrollments),
      this.db
        .select({
          totalDurationMinutes: sql<number>`coalesce(sum(${courses.durationMinutes}), 0)`,
        })
        .from(courses),
      this.db
        .select({ upcomingStartCount: count() })
        .from(courses)
        .where(
          and(
            gte(courses.startDate, today.toISOString().slice(0, 10)),
            lte(courses.startDate, next30Days.toISOString().slice(0, 10)),
          ),
        ),
    ]);

    return plainToInstance(CourseStatsResDto, {
      total: Number(total),
      published: Number(published),
      enrolledLearners: Number(enrolledLearners),
      totalDurationMinutes: Number(totalDurationMinutes),
      upcomingStartCount: Number(upcomingStartCount),
    });
  }

  async create(reqDto: CreateCourseReqDto): Promise<CourseResDto> {
    const duplicatedCourse = await this.db.query.courses.findFirst({
      where: eq(courses.code, reqDto.code),
      columns: {
        id: true,
      },
    });

    if (duplicatedCourse) {
      throw new AppException(
        ErrorCode.E001,
        HttpStatus.CONFLICT,
        'Course code already exists',
      );
    }

    const createdCourse = await this.db.transaction(async (tx) => {
      const course = await this.insertCourse(tx, reqDto);
      const chapterIdByCode = await this.insertChapters(
        tx,
        course,
        reqDto.chapters ?? [],
      );

      await this.insertLessons(
        tx,
        course.id,
        reqDto.lessons ?? [],
        chapterIdByCode,
      );

      return course;
    });

    return this.getCourseByCode(createdCourse.code);
  }

  async update(
    courseCode: string,
    reqDto: UpdateCourseReqDto,
  ): Promise<CourseResDto> {
    const existingCourse = await this.db.query.courses.findFirst({
      where: eq(courses.code, courseCode),
      columns: {
        id: true,
        code: true,
      },
    });

    if (!existingCourse) {
      throw new AppException(
        ErrorCode.E002,
        HttpStatus.NOT_FOUND,
        'Course not found',
      );
    }

    if (reqDto.code && reqDto.code !== courseCode) {
      const duplicatedCourse = await this.db.query.courses.findFirst({
        where: eq(courses.code, reqDto.code),
        columns: {
          id: true,
        },
      });

      if (duplicatedCourse) {
        throw new AppException(
          ErrorCode.E001,
          HttpStatus.CONFLICT,
          'Course code already exists',
        );
      }
    }

    await this.db
      .update(courses)
      .set({
        code: reqDto.code,
        name: reqDto.name,
        category: reqDto.category,
        authorId: reqDto.authorId,
        description: reqDto.description,
        audience: reqDto.audience,
        level: reqDto.level,
        durationMinutes: reqDto.durationMinutes,
        startDate: reqDto.startDate,
        status: reqDto.status,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, existingCourse.id));

    return this.getCourseByCode(reqDto.code ?? courseCode);
  }

  private async insertCourse(
    tx: CourseCreateTx,
    reqDto: CreateCourseReqDto,
  ): Promise<CreatedCourse> {
    const [course] = await tx
      .insert(courses)
      .values({
        code: reqDto.code,
        name: reqDto.name,
        category: reqDto.category,
        authorId: reqDto.authorId,
        description: reqDto.description,
        audience: reqDto.audience,
        level: reqDto.level,
        durationMinutes: reqDto.durationMinutes,
        startDate: reqDto.startDate,
        status: reqDto.status,
      })
      .returning({
        id: courses.id,
        code: courses.code,
      });

    return course;
  }

  private async insertChapters(
    tx: CourseCreateTx,
    course: CreatedCourse,
    chapters: CreateCourseChapterReqDto[],
  ): Promise<Map<string, string>> {
    if (chapters.length === 0) {
      return new Map();
    }

    const insertedChapters = await tx
      .insert(courseChapters)
      .values(this.buildChapterRows(course, chapters))
      .returning({
        id: courseChapters.id,
        code: courseChapters.code,
      });

    return new Map(
      insertedChapters.map((chapter) => [chapter.code, chapter.id]),
    );
  }

  private async insertLessons(
    tx: CourseCreateTx,
    courseId: string,
    lessons: CreateCourseLessonReqDto[],
    chapterIdByCode: Map<string, string>,
  ): Promise<void> {
    if (lessons.length === 0) {
      return;
    }

    await tx
      .insert(courseLessons)
      .values(this.buildLessonRows(courseId, lessons, chapterIdByCode));
  }

  private buildChapterRows(
    course: { id: string; code: string },
    chapters: CreateCourseChapterReqDto[],
  ): ChapterInsertRow[] {
    return chapters.map((chapter, index) => ({
      courseId: course.id,
      code: chapter.chapterCode ?? `${course.code}-C${index + 1}`,
      title: chapter.chapterTitle,
      position: chapter.order ?? index + 1,
    }));
  }

  private buildLessonRows(
    courseId: string,
    lessons: CreateCourseLessonReqDto[],
    chapterIdByCode: Map<string, string>,
  ): LessonInsertRow[] {
    return lessons.map((lesson, index) => ({
      courseId,
      chapterId: lesson.chapterCode
        ? chapterIdByCode.get(lesson.chapterCode)
        : undefined,
      code: lesson.lessonCode,
      title: lesson.lessonTitle,
      durationMinutes: lesson.durationMinutes,
      type: lesson.lessonType,
      status: lesson.status,
      resourceCount: lesson.resourceCount,
      position: lesson.position ?? index + 1,
    }));
  }
}
