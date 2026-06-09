import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import {
  aliasedTable,
  and,
  asc,
  desc,
  eq,
  exists,
  getTableColumns,
  ilike,
  notExists,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { plainToInstance } from 'class-transformer';

import { OffsetPaginatedDto } from '../../common/offset-pagination/paginated.dto';
import { OffsetPaginationDto } from '../../common/offset-pagination/offset-pagination.dto';
import { OrderBy } from '../../constants/app.constant';
import { ErrorCode } from '../../constants/error-code.constant';
import { UserRole } from '../../constants/role.constant';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.type';
import { classCourses } from '../../database/schemas/classes/class-courses';
import { classEnrollments } from '../../database/schemas/classes/class-enrollments';
import { classSessions } from '../../database/schemas/classes/class-sessions';
import { classes } from '../../database/schemas/classes/classes';
import { lessons } from '../../database/schemas/lessons/lessons';
import { courses } from '../../database/schemas/courses/courses';
import { userProfiles } from '../../database/schemas/user-profiles';
import { users } from '../../database/schemas/users';
import { AppException } from '../../exceptions/app.exception';
import { CourseResDto } from '../courses/dto/course.res.dto';
import { UserResDto } from '../users/dto/user.res.dto';
import {
  ClassEnrollmentSource,
  ClassEnrollmentStatus,
  ClassSessionStatus,
  ClassStatus,
  ClassWeekday,
} from './constants/class.constant';
import { AssignClassCourseReqDto } from './dto/assign-class-course.req.dto';
import { ClassCourseStatsResDto } from './dto/class-course-stats.res.dto';
import { ClassEnrollmentResDto } from './dto/class-enrollment.res.dto';
import { ClassResDto } from './dto/class.res.dto';
import { ClassSessionResDto } from './dto/class-session.res.dto';
import { ClassStatsResDto } from './dto/class-stats.res.dto';
import { CreateClassReqDto } from './dto/create-class.req.dto';
import { GetClassCoursesDto } from './dto/get-class-courses.dto';
import { GetClassLearnersDto } from './dto/get-class-learners.dto';
import { GetClassesDto } from './dto/get-classes.dto';
import { InviteUserToClassReqDto } from './dto/invite-user-to-class.req.dto';
import { UnassignedClassCourseResDto } from './dto/unassigned-class-course.res.dto';
import { UpdateClassEnrollmentStatusReqDto } from './dto/update-class-enrollment-status.req.dto';

type ClassSessionRow = {
  id: string;
  code: string;
  title: string;
  courseId: string | null;
  courseName: string | null;
  instructorId: string | null;
  instructorName: string | null;
  sessionDate: string;
  startTime: string;
  endTime: string;
  room: string | null;
  status: `${ClassSessionStatus}`;
};

@Injectable()
export class ClassesService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) {}

  /**
   * Create a class.
   * @param reqDto Class creation payload.
   * @returns The inserted class row.
   */
  async create(reqDto: CreateClassReqDto): Promise<ClassResDto> {
    const code = await this.generateAvailableClassCode();

    const [createdClass] = await this.db
      .insert(classes)
      .values({
        ...reqDto,
        code,
      })
      .returning();

    return plainToInstance(ClassResDto, createdClass);
  }

  private async generateAvailableClassCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = this.generateClassCode();
      const duplicatedClass = await this.db.query.classes.findFirst({
        where: eq(classes.code, code),
        columns: {
          id: true,
        },
      });

      if (!duplicatedClass) return code;
    }

    throw new AppException(
      ErrorCode.E001,
      HttpStatus.CONFLICT,
      'Unable to generate unique class code',
    );
  }

  private generateClassCode(): string {
    const suffix = randomInt(0, 36 ** 4)
      .toString(36)
      .padStart(4, '0')
      .toUpperCase();

    return `CLS-${suffix}`;
  }

  async getClassByCode(classCode: string): Promise<ClassResDto> {
    const [classDetail] = await this.db
      .select({
        ...getTableColumns(classes),
        instructor: getTableColumns(users),
      })
      .from(classes)
      .innerJoin(users, eq(users.id, classes.instructorId))
      .where(eq(classes.code, classCode))
      .limit(1);

    if (!classDetail) {
      throw new AppException(
        ErrorCode.E002,
        HttpStatus.NOT_FOUND,
        'Class not found',
      );
    }

    return plainToInstance(ClassResDto, classDetail);
  }

  async getClasses(
    pageOptions: GetClassesDto,
  ): Promise<OffsetPaginatedDto<ClassResDto>> {
    // Build class list query filters.
    const classFilters = and(
      pageOptions.q
        ? or(
            ilike(classes.code, `%${pageOptions.q}%`),
            ilike(classes.name, `%${pageOptions.q}%`),
          )
        : undefined,
      pageOptions.status ? eq(classes.status, pageOptions.status) : undefined,
    );

    const [entities, [{ total }]] = await Promise.all([
      this.db
        .select({
          ...getTableColumns(classes),
          instructor: getTableColumns(users),
        })
        .from(classes)
        .innerJoin(users, eq(users.id, classes.instructorId))
        .where(classFilters)
        .orderBy(desc(classes.createdAt))
        .limit(pageOptions.limit)
        .offset(pageOptions.offset),
      this.db
        .select({
          total: sql<number>`count(distinct ${classes.id})`.mapWith(Number),
        })
        .from(classes)
        .where(classFilters),
    ]);
    const pagination = new OffsetPaginationDto(total, pageOptions);

    return new OffsetPaginatedDto(
      plainToInstance(ClassResDto, entities),
      pagination,
    );
  }

  async getStats(): Promise<ClassStatsResDto> {
    const [[{ total }], [{ learners }], [{ upcoming }]] = await Promise.all([
      this.db
        .select({
          total: sql<number>`count(distinct ${classes.id})`.mapWith(Number),
        })
        .from(classes),
      this.db
        .select({
          learners:
            sql<number>`count(distinct ${classEnrollments.learnerId})`.mapWith(
              Number,
            ),
        })
        .from(classEnrollments)
        .where(eq(classEnrollments.status, ClassEnrollmentStatus.ACTIVE)),
      this.db
        .select({
          upcoming: sql<number>`count(distinct ${classes.id})`.mapWith(Number),
        })
        .from(classes)
        .where(eq(classes.status, ClassStatus.UPCOMING)),
    ]);

    return plainToInstance(ClassStatsResDto, {
      total,
      learners,
      upcoming,
    });
  }

  async delete(classCode: string): Promise<void> {
    const [deletedClass] = await this.db
      .delete(classes)
      .where(eq(classes.code, classCode))
      .returning({ id: classes.id });

    if (!deletedClass) {
      throw new AppException(
        ErrorCode.E002,
        HttpStatus.NOT_FOUND,
        'Class not found',
      );
    }
  }

  async getClassLearners(
    classCode: string,
    pageOptions: GetClassLearnersDto,
  ): Promise<OffsetPaginatedDto<UserResDto>> {
    const keywordCondition = pageOptions.q
      ? or(
          ilike(users.username, `%${pageOptions.q}%`),
          ilike(users.fullName, `%${pageOptions.q}%`),
          ilike(users.email, `%${pageOptions.q}%`),
        )
      : undefined;
    const where = and(
      eq(classes.code, classCode),
      eq(classEnrollments.status, ClassEnrollmentStatus.ACTIVE),
      keywordCondition,
    );
    const orderBy =
      pageOptions.order === OrderBy.DESC
        ? desc(users.fullName)
        : asc(users.fullName);

    const [entities, [{ total }]] = await Promise.all([
      this.db
        .select({
          ...getTableColumns(users),
          profile: getTableColumns(userProfiles),
        })
        .from(classEnrollments)
        .innerJoin(classes, eq(classes.id, classEnrollments.classId))
        .innerJoin(users, eq(users.id, classEnrollments.learnerId))
        .innerJoin(userProfiles, eq(userProfiles.userId, users.id))
        .where(where)
        .orderBy(orderBy)
        .limit(pageOptions.limit)
        .offset(pageOptions.offset),
      this.db
        .select({
          total: sql<number>`count(distinct ${classEnrollments.id})`.mapWith(
            Number,
          ),
        })
        .from(classEnrollments)
        .innerJoin(classes, eq(classes.id, classEnrollments.classId))
        .innerJoin(users, eq(users.id, classEnrollments.learnerId))
        .innerJoin(userProfiles, eq(userProfiles.userId, users.id))
        .where(where),
    ]);

    return new OffsetPaginatedDto(
      plainToInstance(UserResDto, entities),
      new OffsetPaginationDto(total, pageOptions),
    );
  }

  async getClassCourseStats(
    classCode: string,
  ): Promise<ClassCourseStatsResDto> {
    const classId = await this.getClassIdByCode(classCode);

    const [[classCourseStats], [{ unassignedCount }]] = await Promise.all([
      this.db
        .select({
          attachedCount: sql<number>`count(${classCourses.id})`.mapWith(Number),
          requiredCount:
            sql<number>`count(*) filter (where ${classCourses.required})`.mapWith(
              Number,
            ),
        })
        .from(classCourses)
        .where(eq(classCourses.classId, classId)),
      this.db
        .select({
          unassignedCount: sql<number>`count(${courses.id})`.mapWith(Number),
        })
        .from(courses)
        .where(
          notExists(
            this.db
              .select({ id: classCourses.id })
              .from(classCourses)
              .where(
                and(
                  eq(classCourses.classId, classId),
                  eq(classCourses.courseId, courses.id),
                ),
              ),
          ),
        ),
    ]);

    return plainToInstance(ClassCourseStatsResDto, {
      ...classCourseStats,
      unassignedCount,
    });
  }

  async getUnassignedClassCourses(
    classCode: string,
    pageOptions: GetClassCoursesDto,
  ): Promise<OffsetPaginatedDto<UnassignedClassCourseResDto>> {
    const courseFilters = and(
      pageOptions.q
        ? or(
            ilike(courses.code, `%${pageOptions.q}%`),
            ilike(courses.name, `%${pageOptions.q}%`),
          )
        : undefined,
      notExists(
        this.db
          .select({ id: classCourses.id })
          .from(classCourses)
          .innerJoin(classes, eq(classes.id, classCourses.classId))
          .where(
            and(
              eq(classes.code, classCode),
              eq(classCourses.courseId, courses.id),
            ),
          ),
      ),
    );

    const [entities, [{ total }]] = await Promise.all([
      this.db
        .select({
          id: courses.id,
          code: courses.code,
          name: courses.name,
          category: courses.category,
          lessonCount: sql<number>`count(distinct ${lessons.id})`.mapWith(
            Number,
          ),
        })
        .from(courses)
        .leftJoin(lessons, eq(lessons.courseId, courses.id))
        .where(courseFilters)
        .groupBy(courses.id)
        .orderBy(asc(courses.code))
        .limit(pageOptions.limit)
        .offset(pageOptions.offset),
      this.db
        .select({
          total: sql<number>`count(distinct ${courses.id})`.mapWith(Number),
        })
        .from(courses)
        .where(courseFilters),
    ]);

    return new OffsetPaginatedDto(
      plainToInstance(UnassignedClassCourseResDto, entities),
      new OffsetPaginationDto(total, pageOptions),
    );
  }

  async getClassCourses(
    classCode: string,
    pageOptions: GetClassCoursesDto,
  ): Promise<OffsetPaginatedDto<CourseResDto>> {
    const keywordCondition = pageOptions.q
      ? or(
          ilike(courses.code, `%${pageOptions.q}%`),
          ilike(courses.name, `%${pageOptions.q}%`),
        )
      : undefined;
    const where = and(eq(classes.code, classCode), keywordCondition);
    const orderBy =
      pageOptions.order === OrderBy.DESC
        ? desc(courses.name)
        : asc(courses.name);

    const [entities, [{ total }]] = await Promise.all([
      this.db
        .select({
          ...getTableColumns(courses),
        })
        .from(classCourses)
        .innerJoin(classes, eq(classes.id, classCourses.classId))
        .innerJoin(courses, eq(courses.id, classCourses.courseId))
        .where(where)
        .orderBy(orderBy)
        .limit(pageOptions.limit)
        .offset(pageOptions.offset),
      this.db
        .select({
          total: sql<number>`count(distinct ${classCourses.id})`.mapWith(
            Number,
          ),
        })
        .from(classCourses)
        .innerJoin(classes, eq(classes.id, classCourses.classId))
        .innerJoin(courses, eq(courses.id, classCourses.courseId))
        .where(where),
    ]);

    return new OffsetPaginatedDto(
      plainToInstance(CourseResDto, entities),
      new OffsetPaginationDto(total, pageOptions),
    );
  }

  /**
   * Gán một khóa học vào lớp học.
   * @param classCode Mã lớp học cần gán khóa học.
   * @param reqDto Payload chứa thông tin khóa học cần gán và trạng thái bắt buộc.
   * @returns Chi tiết khóa học đã được gán.
   * @throws AppException khi không tìm thấy lớp, không tìm thấy khóa học hoặc liên kết đã tồn tại.
   */
  async assignClassCourse(
    classCode: string,
    reqDto: AssignClassCourseReqDto,
  ): Promise<CourseResDto> {
    // Lấy ID lớp học dựa trên mã code truyền vào
    const classId = await this.getClassIdByCode(classCode);
    // Kiểm tra sự tồn tại của khóa học trước khi gán
    await this.ensureCourseExists(reqDto.courseId);

    await this.db.transaction(async (tx) => {
      // Thực hiện gán khóa học vào lớp học
      const [insertedClassCourse] = await tx
        .insert(classCourses)
        .values({
          classId,
          ...reqDto,
        })
        .onConflictDoNothing({
          target: [classCourses.classId, classCourses.courseId],
        })
        .returning({
          id: classCourses.id,
        });

      // Nếu không tạo được bản ghi mới (bản ghi đã tồn tại từ trước)
      if (!insertedClassCourse) {
        throw new AppException(
          ErrorCode.E001,
          HttpStatus.CONFLICT,
          'Class course already exists',
        );
      }
    });

    // Trả về thông tin chi tiết của khóa học đã được gán trong lớp học
    return this.getClassCourse(classId, reqDto.courseId);
  }

  async getSessions(classCode: string): Promise<ClassSessionResDto[]> {
    const sessionRows = await this.db
      .select({
        id: classSessions.id,
        code: classSessions.code,
        title: classSessions.title,
        courseId: classSessions.courseId,
        courseName: courses.name,
        instructorId: classSessions.instructorId,
        instructorName: users.fullName,
        sessionDate: classSessions.sessionDate,
        startTime: classSessions.startTime,
        endTime: classSessions.endTime,
        room: classSessions.room,
        status: classSessions.status,
      })
      .from(classSessions)
      .innerJoin(classes, eq(classes.id, classSessions.classId))
      .leftJoin(courses, eq(courses.id, classSessions.courseId))
      .leftJoin(users, eq(users.id, classSessions.instructorId))
      .where(eq(classes.code, classCode))
      .orderBy(asc(classSessions.sessionDate), asc(classSessions.startTime));

    return plainToInstance(
      ClassSessionResDto,
      sessionRows.map((sessionRow) => this.mapClassSessionRow(sessionRow)),
    );
  }

  async getEnrollments(classCode: string): Promise<ClassEnrollmentResDto[]> {
    const enrollmentRows = await this.db
      .select({
        id: classEnrollments.id,
        learnerId: classEnrollments.learnerId,
        studentCode: users.username,
        studentName: users.fullName,
        email: users.email,
        note: classEnrollments.note,
        requestedAt: classEnrollments.enrolledAt,
        reviewedAt: classEnrollments.reviewedAt,
        source: classEnrollments.source,
        status: classEnrollments.status,
      })
      .from(classEnrollments)
      .innerJoin(classes, eq(classes.id, classEnrollments.classId))
      .innerJoin(users, eq(users.id, classEnrollments.learnerId))
      .where(eq(classes.code, classCode))
      .orderBy(desc(classEnrollments.enrolledAt));

    return plainToInstance(
      ClassEnrollmentResDto,
      enrollmentRows.map((enrollmentRow) => ({
        ...enrollmentRow,
        requestedAt: this.formatDateTime(enrollmentRow.requestedAt),
        reviewedAt: this.formatDateTime(enrollmentRow.reviewedAt),
      })),
    );
  }

  async inviteUser(
    classCode: string,
    reqDto: InviteUserToClassReqDto,
  ): Promise<ClassEnrollmentResDto> {
    const classId = await this.getClassIdByCode(classCode);

    const learner = await this.db.query.users.findFirst({
      where: and(
        eq(users.email, reqDto.email),
        eq(users.role, UserRole.LEARNER),
      ),
      columns: {
        id: true,
      },
    });

    if (!learner) {
      throw new AppException(
        ErrorCode.E002,
        HttpStatus.NOT_FOUND,
        'Learner not found',
      );
    }

    const existingEnrollment = await this.db.query.classEnrollments.findFirst({
      where: and(
        eq(classEnrollments.classId, classId),
        eq(classEnrollments.learnerId, learner.id),
      ),
      columns: {
        id: true,
        status: true,
      },
    });

    if (
      existingEnrollment?.status === ClassEnrollmentStatus.ACTIVE ||
      existingEnrollment?.status === ClassEnrollmentStatus.COMPLETED
    ) {
      throw new AppException(
        ErrorCode.E001,
        HttpStatus.CONFLICT,
        'Learner already joined this class',
      );
    }

    const enrollmentId = await this.db.transaction(async (tx) => {
      if (existingEnrollment) {
        const [updatedEnrollment] = await tx
          .update(classEnrollments)
          .set({
            source: ClassEnrollmentSource.INVITE,
            status: ClassEnrollmentStatus.PENDING,
            note: reqDto.note,
            reviewedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(classEnrollments.id, existingEnrollment.id))
          .returning({
            id: classEnrollments.id,
          });

        return updatedEnrollment.id;
      }

      const [createdEnrollment] = await tx
        .insert(classEnrollments)
        .values({
          classId,
          learnerId: learner.id,
          source: ClassEnrollmentSource.INVITE,
          status: ClassEnrollmentStatus.PENDING,
          note: reqDto.note,
        })
        .returning({
          id: classEnrollments.id,
        });

      return createdEnrollment.id;
    });

    return this.getClassEnrollment(classId, enrollmentId);
  }

  async updateEnrollmentStatus(
    classCode: string,
    enrollmentId: string,
    reqDto: UpdateClassEnrollmentStatusReqDto,
  ): Promise<ClassEnrollmentResDto> {
    const classId = await this.getClassIdByCode(classCode);

    const [updatedEnrollment] = await this.db
      .update(classEnrollments)
      .set({
        ...reqDto,
        reviewedAt:
          reqDto.status === ClassEnrollmentStatus.PENDING ? null : new Date(),
      })
      .where(
        and(
          eq(classEnrollments.id, enrollmentId),
          eq(classEnrollments.classId, classId),
        ),
      )
      .returning({
        id: classEnrollments.id,
      });

    if (!updatedEnrollment) {
      throw new AppException(
        ErrorCode.E002,
        HttpStatus.NOT_FOUND,
        'Class enrollment not found',
      );
    }

    return this.getClassEnrollment(classId, updatedEnrollment.id);
  }

  /**
   * Lấy ID lớp học dựa trên mã lớp học (Class Code).
   * @param classCode Mã lớp học cần tra cứu.
   * @returns ID của lớp học.
   * @throws AppException nếu không tìm thấy lớp học.
   */
  private async getClassIdByCode(classCode: string): Promise<string> {
    const classRow = await this.db.query.classes.findFirst({
      where: eq(classes.code, classCode),
      columns: {
        id: true,
      },
    });

    if (!classRow) {
      throw new AppException(
        ErrorCode.E002,
        HttpStatus.NOT_FOUND,
        'Class not found',
      );
    }

    return classRow.id;
  }

  /**
   * Đảm bảo rằng khóa học tồn tại trong hệ thống.
   * @param courseId ID khóa học cần kiểm tra.
   * @throws AppException nếu khóa học không tồn tại.
   */
  private async ensureCourseExists(courseId: string): Promise<void> {
    const course = await this.db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      columns: {
        id: true,
      },
    });

    if (!course) {
      throw new AppException(
        ErrorCode.E002,
        HttpStatus.NOT_FOUND,
        'Course not found',
      );
    }
  }

  private async getClassEnrollment(
    classId: string,
    enrollmentId: string,
  ): Promise<ClassEnrollmentResDto> {
    const [enrollmentRow] = await this.db
      .select({
        id: classEnrollments.id,
        learnerId: classEnrollments.learnerId,
        studentCode: users.username,
        studentName: users.fullName,
        email: users.email,
        note: classEnrollments.note,
        requestedAt: classEnrollments.enrolledAt,
        reviewedAt: classEnrollments.reviewedAt,
        source: classEnrollments.source,
        status: classEnrollments.status,
      })
      .from(classEnrollments)
      .innerJoin(users, eq(users.id, classEnrollments.learnerId))
      .where(
        and(
          eq(classEnrollments.id, enrollmentId),
          eq(classEnrollments.classId, classId),
        ),
      )
      .limit(1);

    if (!enrollmentRow) {
      throw new AppException(
        ErrorCode.E002,
        HttpStatus.NOT_FOUND,
        'Class enrollment not found',
      );
    }

    return plainToInstance(ClassEnrollmentResDto, {
      ...enrollmentRow,
      requestedAt: this.formatDateTime(enrollmentRow.requestedAt),
      reviewedAt: this.formatDateTime(enrollmentRow.reviewedAt),
    });
  }

  private async getClassCourse(
    classId: string,
    courseId: string,
  ): Promise<CourseResDto> {
    const [courseRow] = await this.db
      .select({
        ...getTableColumns(courses),
      })
      .from(classCourses)
      .innerJoin(courses, eq(courses.id, classCourses.courseId))
      .where(
        and(
          eq(classCourses.classId, classId),
          eq(classCourses.courseId, courseId),
        ),
      )
      .limit(1);

    if (!courseRow) {
      throw new AppException(
        ErrorCode.E002,
        HttpStatus.NOT_FOUND,
        'Class course not found',
      );
    }

    return plainToInstance(CourseResDto, courseRow);
  }

  private mapClassSessionRow(sessionRow: ClassSessionRow): ClassSessionResDto {
    const startTime =
      this.formatTime(sessionRow.startTime) ?? sessionRow.startTime;
    const endTime = this.formatTime(sessionRow.endTime) ?? sessionRow.endTime;

    return plainToInstance(ClassSessionResDto, {
      ...sessionRow,
      startTime,
      endTime,
      timeRange: this.formatTimeRange(startTime, endTime) ?? startTime,
    });
  }

  private formatDateTime(dateValue: Date | null): string | null {
    return dateValue ? dateValue.toISOString() : null;
  }

  private formatTimeRange(
    startTime: string | null,
    endTime: string | null,
  ): string | null {
    const formattedStartTime = this.formatTime(startTime);
    const formattedEndTime = this.formatTime(endTime);

    if (!formattedStartTime && !formattedEndTime) {
      return null;
    }

    if (!formattedEndTime) {
      return formattedStartTime;
    }

    return `${formattedStartTime} - ${formattedEndTime}`;
  }

  private formatTime(timeValue: string | null): string | null {
    return timeValue ? timeValue.slice(0, 5) : null;
  }
}
