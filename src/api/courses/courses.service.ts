import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  lte,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { plainToInstance } from 'class-transformer';

import { CourseResDto } from './dto/course.res.dto';
import { CourseCurriculumResDto } from './dto/course-curriculum.res.dto';
import { CourseStatsResDto } from './dto/course-stats.res.dto';
import { CoursesResDto } from './dto/courses.res.dto';
import {
  CreateCourseSectionReqDto,
  CreateLessonReqDto,
  CreateCourseReqDto,
} from './dto/create-course.req.dto';
import { GetCoursesDto } from './dto/get-courses.dto';
import { UpdateCourseReqDto } from './dto/update-course.req.dto';
import type {
  SectionInsertRow,
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
import { courseSections } from '../../database/schemas/courses/course-sections';
import { courseEnrollments } from '../../database/schemas/courses/course-enrollments';
import { lessons as lessonTable } from '../../database/schemas/lessons/lessons';
import { courseObjectives } from '../../database/schemas/courses/course-objectives';
import { courses } from '../../database/schemas/courses/courses';
import { users } from '../../database/schemas/users';

@Injectable()
export class CoursesService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) {}

  async getCourseById(courseId: string): Promise<CourseResDto> {
    const course = await this.db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        author: true,
        lessons: {
          orderBy: asc(lessonTable.position),
        },
      },
    });

    if (!course) {
      throw new AppException(
        ErrorCode.E002,
        HttpStatus.NOT_FOUND,
        'Course not found',
      );
    }

    return plainToInstance(CourseResDto, course);
  }

  async getCourseByCode(courseCode: string): Promise<CourseResDto> {
    const course = await this.db.query.courses.findFirst({
      where: eq(courses.code, courseCode),
      with: {
        author: true,
        lessons: {
          orderBy: asc(lessonTable.position),
        },
      },
    });

    if (!course) {
      throw new AppException(
        ErrorCode.E002,
        HttpStatus.NOT_FOUND,
        'Course not found',
      );
    }

    return plainToInstance(CourseResDto, course);
  }

  async getCourseCurriculum(courseId: string): Promise<CourseCurriculumResDto> {
    const course = await this.db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        author: true,
        objectives: {
          orderBy: asc(courseObjectives.position),
        },
        sections: {
          orderBy: asc(courseSections.position),
          with: {
            lessons: {
              orderBy: asc(lessonTable.position),
            },
          },
        },
      },
    });

    if (!course) {
      throw new AppException(
        ErrorCode.E002,
        HttpStatus.NOT_FOUND,
        'Course not found',
      );
    }

    return plainToInstance(CourseCurriculumResDto, course);
  }

  async getCourses(
    pageOptions: GetCoursesDto,
  ): Promise<OffsetPaginatedDto<CoursesResDto>> {
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

    const [entities, [{ total }]] = await Promise.all([
      this.db
        .select({
          ...getTableColumns(courses),
          author: {
            ...getTableColumns(users),
          },
          learnerCount: sql<number>`count(distinct ${courseEnrollments.id})::int`,
          lessonCount: sql<number>`count(distinct ${lessonTable.id})::int`,
        })
        .from(courses)
        .leftJoin(users, eq(users.id, courses.authorId))
        .leftJoin(courseEnrollments, eq(courseEnrollments.courseId, courses.id))
        .leftJoin(lessonTable, eq(lessonTable.courseId, courses.id))
        .where(where)
        .groupBy(courses.id, users.id)
        .orderBy(orderBy)
        .limit(pageOptions.limit)
        .offset(pageOptions.offset),
      this.db.select({ total: count() }).from(courses).where(where),
    ]);

    return new OffsetPaginatedDto(
      plainToInstance(CoursesResDto, entities),
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
      const sectionIdByCode = await this.insertSections(
        tx,
        course,
        reqDto.sections ?? [],
      );

      await this.insertLessons(
        tx,
        course.id,
        reqDto.lessons ?? [],
        sectionIdByCode,
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

  private async insertSections(
    tx: CourseCreateTx,
    course: CreatedCourse,
    sections: CreateCourseSectionReqDto[],
  ): Promise<Map<string, string>> {
    if (sections.length === 0) {
      return new Map();
    }

    const insertedSections = await tx
      .insert(courseSections)
      .values(this.buildSectionRows(course, sections))
      .returning({
        id: courseSections.id,
        code: courseSections.code,
      });

    return new Map(
      insertedSections.map((section) => [section.code, section.id]),
    );
  }

  private async insertLessons(
    tx: CourseCreateTx,
    courseId: string,
    lessons: CreateLessonReqDto[],
    sectionIdByCode: Map<string, string>,
  ): Promise<void> {
    if (lessons.length === 0) {
      return;
    }

    await tx
      .insert(lessonTable)
      .values(this.buildLessonRows(courseId, lessons, sectionIdByCode));
  }

  private buildSectionRows(
    course: { id: string; code: string },
    sections: CreateCourseSectionReqDto[],
  ): SectionInsertRow[] {
    return sections.map((section, index) => ({
      courseId: course.id,
      code: section.sectionCode ?? `${course.code}-C${index + 1}`,
      title: section.sectionTitle,
      position: section.order ?? index + 1,
    }));
  }

  private buildLessonRows(
    courseId: string,
    lessons: CreateLessonReqDto[],
    sectionIdByCode: Map<string, string>,
  ): LessonInsertRow[] {
    return lessons.map((lesson, index) => ({
      courseId,
      sectionId: lesson.sectionCode
        ? sectionIdByCode.get(lesson.sectionCode)
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
