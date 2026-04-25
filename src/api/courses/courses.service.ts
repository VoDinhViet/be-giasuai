import { randomBytes } from 'crypto';

import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { and, asc, count, desc, eq, ilike, or, SQL } from 'drizzle-orm';

import { JwtPayloadType } from '..\../api/auth/types/jwt-payload.type';
import { OffsetPaginatedDto } from '..\../common/offset-pagination/paginated.dto';
import { OffsetPaginationDto } from '..\../common/offset-pagination/offset-pagination.dto';
import { OrderBy } from '..\../constants/app.constant';
import { ErrorCode } from '..\../constants/error-code.constant';
import { Role } from '..\../constants/role.constant';
import { DRIZZLE } from '..\../database/database.module';
import type { Database } from '..\../database/database.type';
import {
  courseLessons,
  courseResources,
  courseSections,
  courses,
} from '..\../database/schemas';
import { AppException } from '..\../exceptions/app.exception';

import { CourseContentResDto } from './dto/course-content.res.dto';
import { CourseDetailLessonResDto } from './dto/course-detail-lesson.res.dto';
import { CourseDetailResDto } from './dto/course-detail.res.dto';
import { CourseDetailSectionResDto } from './dto/course-detail-section.res.dto';
import { CourseLessonResDto } from './dto/course-lesson.res.dto';
import { CourseResourceResDto } from './dto/course-resource.res.dto';
import { CourseResDto } from './dto/course.res.dto';
import { CourseSectionResDto } from './dto/course-section.res.dto';
import { CreateCourseReqDto } from './dto/create-course.req.dto';
import { CreateCourseLessonReqDto } from './dto/create-course-lesson.req.dto';
import { CreateCourseResourceReqDto } from './dto/create-course-resource.req.dto';
import { CreateCourseSectionReqDto } from './dto/create-course-section.req.dto';
import { GetCoursesReqDto } from './dto/get-courses.req.dto';
import { UpdateCourseLessonReqDto } from './dto/update-course-lesson.req.dto';
import { UpdateCourseResourceReqDto } from './dto/update-course-resource.req.dto';
import { UpdateCourseSectionReqDto } from './dto/update-course-section.req.dto';

@Injectable()
export class CoursesService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) { }

  async createCourse(dto: CreateCourseReqDto): Promise<CourseResDto> {
    const slug = await this.generateUniqueSlug(dto.title);

    const [createdCourse] = await this.db
      .insert(courses)
      .values({
        title: dto.title,
        description: dto.description,
        shortDescription: dto.shortDescription,
        slug,
        thumbnailUrl: dto.thumbnailUrl,
        introVideoUrl: dto.introVideoUrl,
        teacherId: dto.teacherId,
        level: dto.level,
        price: dto.price,
        estimatedDurationMinutes: dto.estimatedDurationMinutes,
        tags: dto.tags,
        learningOutcomes: dto.learningOutcomes,
      })
      .returning({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        description: courses.description,
        shortDescription: courses.shortDescription,
        thumbnailUrl: courses.thumbnailUrl,
        introVideoUrl: courses.introVideoUrl,
        teacherId: courses.teacherId,
        level: courses.level,
        price: courses.price,
        estimatedDurationMinutes: courses.estimatedDurationMinutes,
        tags: courses.tags,
        learningOutcomes: courses.learningOutcomes,
        isPublished: courses.isPublished,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
      });

    return plainToInstance(CourseResDto, createdCourse);
  }

  /**
   * Lấy danh sách khóa học có phân trang và bộ lọc.
   *
   * @param pageOptions - Tùy chọn phân trang và bộ lọc (q, isPublished).
   * @returns Danh sách khóa học đã phân trang.
   */
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
      columns: {
        id: true,
        title: true,
        slug: true,
        description: true,
        shortDescription: true,
        thumbnailUrl: true,
        introVideoUrl: true,
        teacherId: true,
        level: true,
        price: true,
        estimatedDurationMinutes: true,
        tags: true,
        learningOutcomes: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!course || !course.isPublished) {
      throw new AppException(
        ErrorCode.E105,
        'Course not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const [sectionRows, lessonRows] = await Promise.all([
      this.db
        .select({
          id: courseSections.id,
          courseId: courseSections.courseId,
          title: courseSections.title,
          description: courseSections.description,
          position: courseSections.position,
          createdAt: courseSections.createdAt,
          updatedAt: courseSections.updatedAt,
        })
        .from(courseSections)
        .where(eq(courseSections.courseId, courseId))
        .orderBy(asc(courseSections.position), asc(courseSections.createdAt)),
      this.db
        .select({
          id: courseLessons.id,
          sectionId: courseLessons.sectionId,
          title: courseLessons.title,
          summary: courseLessons.summary,
          lessonType: courseLessons.lessonType,
          durationMinutes: courseLessons.durationMinutes,
          position: courseLessons.position,
          isPreview: courseLessons.isPreview,
          isPublished: courseLessons.isPublished,
          createdAt: courseLessons.createdAt,
          updatedAt: courseLessons.updatedAt,
        })
        .from(courseLessons)
        .innerJoin(
          courseSections,
          eq(courseLessons.sectionId, courseSections.id),
        )
        .where(
          and(
            eq(courseSections.courseId, courseId),
            eq(courseLessons.isPublished, true),
          ),
        )
        .orderBy(asc(courseLessons.position), asc(courseLessons.createdAt)),
    ]);

    const lessonsBySection = new Map<string, CourseDetailLessonResDto[]>();

    lessonRows.forEach((lesson) => {
      const items = lessonsBySection.get(lesson.sectionId) ?? [];
      items.push(plainToInstance(CourseDetailLessonResDto, lesson));
      lessonsBySection.set(lesson.sectionId, items);
    });

    return plainToInstance(CourseDetailResDto, {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription,
      thumbnailUrl: course.thumbnailUrl,
      introVideoUrl: course.introVideoUrl,
      teacherId: course.teacherId,
      level: course.level,
      price: course.price,
      estimatedDurationMinutes: course.estimatedDurationMinutes,
      tags: course.tags,
      learningOutcomes: course.learningOutcomes,
      isPublished: course.isPublished,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      sections: sectionRows.map((section) =>
        plainToInstance(CourseDetailSectionResDto, {
          ...section,
          lessons: lessonsBySection.get(section.id) ?? [],
        }),
      ),
    });
  }

  async getCourseContent(
    courseId: string,
    payload: JwtPayloadType,
  ): Promise<CourseContentResDto> {
    const course = await this.db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      columns: {
        id: true,
        title: true,
        slug: true,
        description: true,
        shortDescription: true,
        thumbnailUrl: true,
        introVideoUrl: true,
        teacherId: true,
        level: true,
        price: true,
        estimatedDurationMinutes: true,
        tags: true,
        learningOutcomes: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!course) {
      throw new AppException(
        ErrorCode.E105,
        'Course not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (payload.role === Role.USER && !course.isPublished) {
      throw new AppException(
        ErrorCode.E103,
        'You do not have permission to view this course',
        HttpStatus.FORBIDDEN,
      );
    }

    if (payload.role === Role.TEACHER && course.teacherId !== payload.userId) {
      throw new AppException(
        ErrorCode.E103,
        'You do not have permission to manage this course',
        HttpStatus.FORBIDDEN,
      );
    }

    const [sectionRows, lessonRows, resourceRows] = await Promise.all([
      this.db
        .select({
          id: courseSections.id,
          courseId: courseSections.courseId,
          title: courseSections.title,
          description: courseSections.description,
          position: courseSections.position,
          createdAt: courseSections.createdAt,
          updatedAt: courseSections.updatedAt,
        })
        .from(courseSections)
        .where(eq(courseSections.courseId, courseId))
        .orderBy(asc(courseSections.position), asc(courseSections.createdAt)),
      this.db
        .select({
          id: courseLessons.id,
          sectionId: courseLessons.sectionId,
          title: courseLessons.title,
          summary: courseLessons.summary,
          content: courseLessons.content,
          videoUrl: courseLessons.videoUrl,
          lessonType: courseLessons.lessonType,
          durationMinutes: courseLessons.durationMinutes,
          position: courseLessons.position,
          isPreview: courseLessons.isPreview,
          isPublished: courseLessons.isPublished,
          createdAt: courseLessons.createdAt,
          updatedAt: courseLessons.updatedAt,
        })
        .from(courseLessons)
        .innerJoin(
          courseSections,
          eq(courseLessons.sectionId, courseSections.id),
        )
        .where(eq(courseSections.courseId, courseId))
        .orderBy(asc(courseLessons.position), asc(courseLessons.createdAt)),
      this.db
        .select({
          id: courseResources.id,
          lessonId: courseResources.lessonId,
          title: courseResources.title,
          resourceType: courseResources.resourceType,
          resourceUrl: courseResources.resourceUrl,
          createdAt: courseResources.createdAt,
        })
        .from(courseResources)
        .innerJoin(
          courseLessons,
          eq(courseResources.lessonId, courseLessons.id),
        )
        .innerJoin(
          courseSections,
          eq(courseLessons.sectionId, courseSections.id),
        )
        .where(eq(courseSections.courseId, courseId))
        .orderBy(asc(courseResources.createdAt)),
    ]);

    const resourcesByLesson = new Map<string, CourseResourceResDto[]>();

    resourceRows.forEach((resource) => {
      const items = resourcesByLesson.get(resource.lessonId) ?? [];
      items.push(plainToInstance(CourseResourceResDto, resource));
      resourcesByLesson.set(resource.lessonId, items);
    });

    const lessonsBySection = new Map<string, CourseLessonResDto[]>();

    lessonRows.forEach((lesson) => {
      const items = lessonsBySection.get(lesson.sectionId) ?? [];
      items.push(
        plainToInstance(CourseLessonResDto, {
          ...lesson,
          resources: resourcesByLesson.get(lesson.id) ?? [],
        }),
      );
      lessonsBySection.set(lesson.sectionId, items);
    });

    return plainToInstance(CourseContentResDto, {
      courseId: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription,
      thumbnailUrl: course.thumbnailUrl,
      introVideoUrl: course.introVideoUrl,
      teacherId: course.teacherId,
      level: course.level,
      price: course.price,
      estimatedDurationMinutes: course.estimatedDurationMinutes,
      tags: course.tags,
      learningOutcomes: course.learningOutcomes,
      isPublished: course.isPublished,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      sections: sectionRows.map((section) =>
        plainToInstance(CourseSectionResDto, {
          ...section,
          lessons: lessonsBySection.get(section.id) ?? [],
        }),
      ),
    });
  }

  async createSection(
    courseId: string,
    dto: CreateCourseSectionReqDto,
    payload: JwtPayloadType,
  ): Promise<CourseSectionResDto> {
    await this.ensureCourseManagePermission(courseId, payload);

    const [section] = await this.db
      .insert(courseSections)
      .values({
        courseId,
        title: dto.title,
        description: dto.description,
        position: dto.position,
      })
      .returning({
        id: courseSections.id,
        courseId: courseSections.courseId,
        title: courseSections.title,
        description: courseSections.description,
        position: courseSections.position,
        createdAt: courseSections.createdAt,
        updatedAt: courseSections.updatedAt,
      });

    return plainToInstance(CourseSectionResDto, {
      ...section,
      lessons: [],
    });
  }

  async updateSection(
    courseId: string,
    sectionId: string,
    dto: UpdateCourseSectionReqDto,
    payload: JwtPayloadType,
  ): Promise<CourseSectionResDto> {
    await this.ensureCourseManagePermission(courseId, payload);
    await this.ensureSectionBelongsToCourse(courseId, sectionId);

    const [section] = await this.db
      .update(courseSections)
      .set({
        title: dto.title,
        description: dto.description,
        position: dto.position,
      })
      .where(eq(courseSections.id, sectionId))
      .returning({
        id: courseSections.id,
        courseId: courseSections.courseId,
        title: courseSections.title,
        description: courseSections.description,
        position: courseSections.position,
        createdAt: courseSections.createdAt,
        updatedAt: courseSections.updatedAt,
      });

    return plainToInstance(CourseSectionResDto, {
      ...section,
      lessons: [],
    });
  }

  async deleteSection(
    courseId: string,
    sectionId: string,
    payload: JwtPayloadType,
  ): Promise<void> {
    await this.ensureCourseManagePermission(courseId, payload);
    await this.ensureSectionBelongsToCourse(courseId, sectionId);

    await this.db
      .delete(courseSections)
      .where(eq(courseSections.id, sectionId));
  }

  async createLesson(
    courseId: string,
    sectionId: string,
    dto: CreateCourseLessonReqDto,
    payload: JwtPayloadType,
  ): Promise<CourseLessonResDto> {
    await this.ensureCourseManagePermission(courseId, payload);
    await this.ensureSectionBelongsToCourse(courseId, sectionId);

    const [lesson] = await this.db
      .insert(courseLessons)
      .values({
        sectionId,
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        videoUrl: dto.videoUrl,
        lessonType: dto.lessonType,
        durationMinutes: dto.durationMinutes,
        position: dto.position,
        isPreview: dto.isPreview,
        isPublished: dto.isPublished,
      })
      .returning({
        id: courseLessons.id,
        sectionId: courseLessons.sectionId,
        title: courseLessons.title,
        summary: courseLessons.summary,
        content: courseLessons.content,
        videoUrl: courseLessons.videoUrl,
        lessonType: courseLessons.lessonType,
        durationMinutes: courseLessons.durationMinutes,
        position: courseLessons.position,
        isPreview: courseLessons.isPreview,
        isPublished: courseLessons.isPublished,
        createdAt: courseLessons.createdAt,
        updatedAt: courseLessons.updatedAt,
      });

    return plainToInstance(CourseLessonResDto, {
      ...lesson,
      resources: [],
    });
  }

  async updateLesson(
    courseId: string,
    sectionId: string,
    lessonId: string,
    dto: UpdateCourseLessonReqDto,
    payload: JwtPayloadType,
  ): Promise<CourseLessonResDto> {
    await this.ensureCourseManagePermission(courseId, payload);
    await this.ensureLessonBelongsToSection(courseId, sectionId, lessonId);

    const [lesson] = await this.db
      .update(courseLessons)
      .set({
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        videoUrl: dto.videoUrl,
        lessonType: dto.lessonType,
        durationMinutes: dto.durationMinutes,
        position: dto.position,
        isPreview: dto.isPreview,
        isPublished: dto.isPublished,
      })
      .where(eq(courseLessons.id, lessonId))
      .returning({
        id: courseLessons.id,
        sectionId: courseLessons.sectionId,
        title: courseLessons.title,
        summary: courseLessons.summary,
        content: courseLessons.content,
        videoUrl: courseLessons.videoUrl,
        lessonType: courseLessons.lessonType,
        durationMinutes: courseLessons.durationMinutes,
        position: courseLessons.position,
        isPreview: courseLessons.isPreview,
        isPublished: courseLessons.isPublished,
        createdAt: courseLessons.createdAt,
        updatedAt: courseLessons.updatedAt,
      });

    const resources = await this.db
      .select({
        id: courseResources.id,
        lessonId: courseResources.lessonId,
        title: courseResources.title,
        resourceType: courseResources.resourceType,
        resourceUrl: courseResources.resourceUrl,
        createdAt: courseResources.createdAt,
      })
      .from(courseResources)
      .where(eq(courseResources.lessonId, lessonId))
      .orderBy(asc(courseResources.createdAt));

    return plainToInstance(CourseLessonResDto, {
      ...lesson,
      resources: plainToInstance(CourseResourceResDto, resources),
    });
  }

  async deleteLesson(
    courseId: string,
    sectionId: string,
    lessonId: string,
    payload: JwtPayloadType,
  ): Promise<void> {
    await this.ensureCourseManagePermission(courseId, payload);
    await this.ensureLessonBelongsToSection(courseId, sectionId, lessonId);

    await this.db.delete(courseLessons).where(eq(courseLessons.id, lessonId));
  }

  async createResource(
    courseId: string,
    sectionId: string,
    lessonId: string,
    dto: CreateCourseResourceReqDto,
    payload: JwtPayloadType,
  ): Promise<CourseResourceResDto> {
    await this.ensureCourseManagePermission(courseId, payload);
    await this.ensureLessonBelongsToSection(courseId, sectionId, lessonId);

    const [resource] = await this.db
      .insert(courseResources)
      .values({
        lessonId,
        title: dto.title,
        resourceType: dto.resourceType,
        resourceUrl: dto.resourceUrl,
      })
      .returning({
        id: courseResources.id,
        lessonId: courseResources.lessonId,
        title: courseResources.title,
        resourceType: courseResources.resourceType,
        resourceUrl: courseResources.resourceUrl,
        createdAt: courseResources.createdAt,
      });

    return plainToInstance(CourseResourceResDto, resource);
  }

  async updateResource(
    courseId: string,
    sectionId: string,
    lessonId: string,
    resourceId: string,
    dto: UpdateCourseResourceReqDto,
    payload: JwtPayloadType,
  ): Promise<CourseResourceResDto> {
    await this.ensureCourseManagePermission(courseId, payload);
    await this.ensureResourceBelongsToLesson(
      courseId,
      sectionId,
      lessonId,
      resourceId,
    );

    const [resource] = await this.db
      .update(courseResources)
      .set({
        title: dto.title,
        resourceType: dto.resourceType,
        resourceUrl: dto.resourceUrl,
      })
      .where(eq(courseResources.id, resourceId))
      .returning({
        id: courseResources.id,
        lessonId: courseResources.lessonId,
        title: courseResources.title,
        resourceType: courseResources.resourceType,
        resourceUrl: courseResources.resourceUrl,
        createdAt: courseResources.createdAt,
      });

    return plainToInstance(CourseResourceResDto, resource);
  }

  async deleteResource(
    courseId: string,
    sectionId: string,
    lessonId: string,
    resourceId: string,
    payload: JwtPayloadType,
  ): Promise<void> {
    await this.ensureCourseManagePermission(courseId, payload);
    await this.ensureResourceBelongsToLesson(
      courseId,
      sectionId,
      lessonId,
      resourceId,
    );

    await this.db
      .delete(courseResources)
      .where(eq(courseResources.id, resourceId));
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

  private async ensureCourseManagePermission(
    courseId: string,
    payload: JwtPayloadType,
  ) {
    const course = await this.db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      columns: {
        id: true,
        teacherId: true,
      },
    });

    if (!course) {
      throw new AppException(
        ErrorCode.E105,
        'Course not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (payload.role === Role.ADMIN) {
      return course;
    }

    if (payload.role === Role.TEACHER && course.teacherId === payload.userId) {
      return course;
    }

    throw new AppException(
      ErrorCode.E103,
      'You do not have permission to manage this course',
      HttpStatus.FORBIDDEN,
    );
  }

  private async ensureSectionBelongsToCourse(
    courseId: string,
    sectionId: string,
  ) {
    const section = await this.db.query.courseSections.findFirst({
      where: eq(courseSections.id, sectionId),
      columns: {
        id: true,
        courseId: true,
      },
    });

    if (!section || section.courseId !== courseId) {
      throw new AppException(
        ErrorCode.E105,
        'Course section not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return section;
  }

  private async ensureLessonBelongsToSection(
    courseId: string,
    sectionId: string,
    lessonId: string,
  ) {
    await this.ensureSectionBelongsToCourse(courseId, sectionId);

    const lesson = await this.db.query.courseLessons.findFirst({
      where: eq(courseLessons.id, lessonId),
      columns: {
        id: true,
        sectionId: true,
      },
    });

    if (!lesson || lesson.sectionId !== sectionId) {
      throw new AppException(
        ErrorCode.E105,
        'Course lesson not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return lesson;
  }

  private async ensureResourceBelongsToLesson(
    courseId: string,
    sectionId: string,
    lessonId: string,
    resourceId: string,
  ) {
    await this.ensureLessonBelongsToSection(courseId, sectionId, lessonId);

    const resource = await this.db.query.courseResources.findFirst({
      where: eq(courseResources.id, resourceId),
      columns: {
        id: true,
        lessonId: true,
      },
    });

    if (!resource || resource.lessonId !== lessonId) {
      throw new AppException(
        ErrorCode.E105,
        'Course resource not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return resource;
  }

  private slugify(value: string): string {
    const slug = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return slug || `course-${randomBytes(3).toString('hex')}`;
  }
}
