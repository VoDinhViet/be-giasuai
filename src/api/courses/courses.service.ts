import { unlink } from 'fs/promises';
import { join } from 'path';

import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm';

import { OffsetPaginatedDto } from '../../common/offset-pagination/paginated.dto';
import { OffsetPaginationDto } from '../../common/offset-pagination/offset-pagination.dto';
import { OrderBy } from '../../constants/app.constant';
import { ErrorCode } from '../../constants/error-code.constant';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.type';
import { courseSections, courses, lessons } from '../../database/schemas';
import { AppException } from '../../exceptions/app.exception';

import { CourseDetailResDto } from './dto/course-detail.res.dto';
import { CourseSectionWithLessonsResDto } from './dto/course-section-with-lessons.res.dto';

import { CourseResDto } from './dto/course.res.dto';
import { PageCoursesReqDto } from './dto/page-courses.req.dto';

@Injectable()
export class CoursesService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) {}

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
              orderBy: [asc(lessons.position), asc(lessons.createdAt)],
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
}
