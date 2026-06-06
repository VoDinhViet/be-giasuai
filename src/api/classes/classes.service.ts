import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  aliasedTable,
  and,
  asc,
  desc,
  eq,
  exists,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { plainToInstance } from 'class-transformer';

import { OffsetPaginatedDto } from '../../common/offset-pagination/paginated.dto';
import { OffsetPaginationDto } from '../../common/offset-pagination/offset-pagination.dto';
import { OrderBy } from '../../constants/app.constant';
import { ErrorCode } from '../../constants/error-code.constant';
import { getPermissionCodesByRole } from '../../constants/permission.constant';
import { Role } from '../../constants/role.constant';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.type';
import { classCourses } from '../../database/schemas/classes/class-courses';
import { classEnrollments } from '../../database/schemas/classes/class-enrollments';
import {
  classSessions,
  type NewClassSession,
} from '../../database/schemas/classes/class-sessions';
import { classes } from '../../database/schemas/classes/classes';
import { courseLessons } from '../../database/schemas/courses/course-lessons';
import { courses } from '../../database/schemas/courses/courses';
import { userProfiles } from '../../database/schemas/user-profiles';
import { users } from '../../database/schemas/users';
import { AppException } from '../../exceptions/app.exception';
import type { JwtPayloadType } from '../auth/types/jwt-payload.type';
import {
  ClassEnrollmentSource,
  ClassEnrollmentStatus,
  ClassSessionStatus,
  ClassStatus,
  ClassWeekday,
} from './constants/class.constant';
import { AddClassCourseReqDto } from './dto/add-class-course.req.dto';
import { ClassCourseResDto } from './dto/class-course.res.dto';
import { ClassEnrollmentResDto } from './dto/class-enrollment.res.dto';
import { ClassLearnerResDto } from './dto/class-learner.res.dto';
import { ClasseResDto, ClassResDto } from './dto/class.res.dto';
import { ClassSessionResDto } from './dto/class-session.res.dto';
import { ClassStatsResDto } from './dto/class-stats.res.dto';
import { CreateClassReqDto } from './dto/create-class.req.dto';
import { GetClassCoursesDto } from './dto/get-class-courses.dto';
import { GetClassLearnersDto } from './dto/get-class-learners.dto';
import { GetClassesDto } from './dto/get-classes.dto';
import { InviteUserToClassReqDto } from './dto/invite-user-to-class.req.dto';
import { UpdateClassEnrollmentStatusReqDto } from './dto/update-class-enrollment-status.req.dto';

const WEEKDAY_LABELS = {
  [ClassWeekday.MONDAY]: 'T2',
  [ClassWeekday.TUESDAY]: 'T3',
  [ClassWeekday.WEDNESDAY]: 'T4',
  [ClassWeekday.THURSDAY]: 'T5',
  [ClassWeekday.FRIDAY]: 'T6',
  [ClassWeekday.SATURDAY]: 'T7',
  [ClassWeekday.SUNDAY]: 'CN',
} satisfies Record<`${ClassWeekday}`, string>;

const STUDENT_VISIBLE_ENROLLMENT_STATUSES = [
  ClassEnrollmentStatus.ACTIVE,
  ClassEnrollmentStatus.COMPLETED,
];

type ClassScheduleSource = {
  repeatDays: `${ClassWeekday}`[];
  startTime: string | null;
  endTime: string | null;
};

type ClassInstructorRow = {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  isLocked: boolean;
  createdAt: Date;
};

type ClassInstructorRes = ClassInstructorRow & {
  permissionCodes: string[];
  profile: {
    userId: string;
    phone: string | null;
    location: string | null;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

type ClassBaseRow = ClassScheduleSource & {
  id: string;
  code: string;
  name: string;
  instructor: ClassInstructorRes;
  maxStudents: number;
  meetingUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  status: `${ClassStatus}`;
  format: string;
  joinPolicy: string;
  waitlistEnabled: boolean;
  reminderEnabled: boolean;
  autoCreateSessions: boolean;
  note: string | null;
};

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

  async create(reqDto: CreateClassReqDto): Promise<ClassResDto> {
    const requestedCourseIds = this.getRequestedCourseIds(reqDto);
    const {
      courseId: _courseId,
      courseIds: _courseIds,
      ...classValues
    } = reqDto;
    const duplicatedClass = await this.db.query.classes.findFirst({
      where: eq(classes.code, reqDto.code),
      columns: {
        id: true,
      },
    });

    if (duplicatedClass) {
      throw new AppException(
        ErrorCode.E001,
        'Class code already exists',
        HttpStatus.CONFLICT,
      );
    }

    const createdClass = await this.db.transaction(async (tx) => {
      const [classRow] = await tx
        .insert(classes)
        .values(classValues)
        .returning({
          id: classes.id,
          code: classes.code,
        });

      const sessionCourseId =
        requestedCourseIds.length === 1 ? requestedCourseIds[0] : null;
      const sessionRows = this.buildAutoSessionRows(
        classRow.id,
        reqDto,
        sessionCourseId,
      );

      if (sessionRows.length > 0) {
        await tx.insert(classSessions).values(sessionRows);
      }

      if (requestedCourseIds.length > 0) {
        await tx.insert(classCourses).values(
          requestedCourseIds.map((courseId) => ({
            classId: classRow.id,
            courseId,
            required: true,
          })),
        );
      }

      return classRow;
    });

    return this.getClassByCode(createdClass.code);
  }

  async getClassByCode(classCode: string): Promise<ClassResDto> {
    const classRow = await this.getClassBaseRow(classCode);
    const [courses, students, sessions] = await Promise.all([
      this.getClassCoursesByClassId(classRow.id),
      this.getActiveLearners(classRow),
      this.getClassSessionsByClassId(classRow.id),
    ]);

    return plainToInstance(ClassResDto, {
      ...classRow,
      studentCount: students.length,
      courses,
      students,
      sessions,
      schedule:
        [
          classRow.repeatDays
            .map((weekday) => WEEKDAY_LABELS[weekday])
            .join(', '),
          this.formatTimeRange(classRow.startTime, classRow.endTime),
        ]
          .filter(Boolean)
          .join(' - ') || null,
    });
  }

  async getClasses(
    pageOptions: GetClassesDto,
    payload?: JwtPayloadType,
  ): Promise<OffsetPaginatedDto<ClasseResDto>> {
    const conditions: SQL[] = [];

    if (pageOptions.q) {
      const searchedClassCourses = aliasedTable(
        classCourses,
        'searched_class_courses',
      );
      const searchedCourses = aliasedTable(courses, 'searched_courses');
      const searchedInstructors = aliasedTable(users, 'searched_instructors');
      const q = or(
        ilike(classes.code, `%${pageOptions.q}%`),
        ilike(classes.name, `%${pageOptions.q}%`),
        exists(
          this.db
            .select({ id: searchedClassCourses.id })
            .from(searchedClassCourses)
            .innerJoin(
              searchedCourses,
              eq(searchedCourses.id, searchedClassCourses.courseId),
            )
            .where(
              and(
                eq(searchedClassCourses.classId, classes.id),
                ilike(searchedCourses.name, `%${pageOptions.q}%`),
              ),
            ),
        ),
        exists(
          this.db
            .select({ id: searchedInstructors.id })
            .from(searchedInstructors)
            .where(
              and(
                eq(searchedInstructors.id, classes.instructorId),
                ilike(searchedInstructors.fullName, `%${pageOptions.q}%`),
              ),
            ),
        ),
      );

      if (q) conditions.push(q);
    }

    if (pageOptions.status) {
      conditions.push(eq(classes.status, pageOptions.status));
    }

    if (pageOptions.courseId) {
      const filteredClassCourses = aliasedTable(
        classCourses,
        'filtered_class_courses',
      );

      conditions.push(
        exists(
          this.db
            .select({ id: filteredClassCourses.id })
            .from(filteredClassCourses)
            .where(
              and(
                eq(filteredClassCourses.classId, classes.id),
                eq(filteredClassCourses.courseId, pageOptions.courseId),
              ),
            ),
        ),
      );
    }

    if (pageOptions.instructorId) {
      conditions.push(eq(classes.instructorId, pageOptions.instructorId));
    }

    if (payload?.role === Role.STUDENT) {
      const learnerClassEnrollments = aliasedTable(
        classEnrollments,
        'learner_class_enrollments',
      );

      conditions.push(
        exists(
          this.db
            .select({ id: learnerClassEnrollments.id })
            .from(learnerClassEnrollments)
            .where(
              and(
                eq(learnerClassEnrollments.classId, classes.id),
                eq(learnerClassEnrollments.learnerId, payload.userId),
                inArray(
                  learnerClassEnrollments.status,
                  STUDENT_VISIBLE_ENROLLMENT_STATUSES,
                ),
              ),
            ),
        ),
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const orderBy =
      pageOptions.order === OrderBy.DESC
        ? desc(classes.createdAt)
        : asc(classes.createdAt);

    const [entities, [{ total }]] = await Promise.all([
      this.db.query.classes.findMany({
        with: {
          instructor: {
            with: {
              profile: true,
            },
          },
        },
        where,
        orderBy,
        limit: pageOptions.limit,
        offset: pageOptions.offset,
      }),
      this.db
        .select({
          total: sql<number>`count(distinct ${classes.id})`.mapWith(Number),
        })
        .from(classes)
        .where(where),
    ]);
    const pagination = new OffsetPaginationDto(total, pageOptions);

    return new OffsetPaginatedDto(
      plainToInstance(
        ClasseResDto,
        entities.map((entity) => ({
          ...entity,
          instructor: {
            ...entity.instructor,
            permissionCodes: getPermissionCodesByRole(entity.instructor.role),
          },
        })),
      ),
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

  async getDetail(classCode: string): Promise<ClassResDto> {
    return this.getClassByCode(classCode);
  }

  async getClassLearners(
    classCode: string,
    pageOptions: GetClassLearnersDto,
  ): Promise<OffsetPaginatedDto<ClassLearnerResDto>> {
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
          id: users.id,
          email: users.email,
          username: users.username,
          fullName: users.fullName,
          role: users.role,
          isLocked: users.isLocked,
          createdAt: users.createdAt,
        })
        .from(classEnrollments)
        .innerJoin(classes, eq(classes.id, classEnrollments.classId))
        .innerJoin(users, eq(users.id, classEnrollments.learnerId))
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
        .where(where),
    ]);

    return new OffsetPaginatedDto(
      plainToInstance(ClassLearnerResDto, entities),
      new OffsetPaginationDto(total, pageOptions),
    );
  }

  async getClassCourses(
    classCode: string,
    pageOptions: GetClassCoursesDto,
  ): Promise<OffsetPaginatedDto<ClassCourseResDto>> {
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
          courseId: courses.id,
          courseCode: courses.code,
          courseName: courses.name,
          lessonCount: sql<number>`count(${courseLessons.id})`.mapWith(Number),
          required: classCourses.required,
        })
        .from(classCourses)
        .innerJoin(classes, eq(classes.id, classCourses.classId))
        .innerJoin(courses, eq(courses.id, classCourses.courseId))
        .leftJoin(courseLessons, eq(courseLessons.courseId, courses.id))
        .where(where)
        .groupBy(classCourses.id, courses.id)
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
      plainToInstance(
        ClassCourseResDto,
        entities.map((entity) => ({
          ...entity,
          completedLessons: 0,
        })),
      ),
      new OffsetPaginationDto(total, pageOptions),
    );
  }

  async addCourse(
    classCode: string,
    reqDto: AddClassCourseReqDto,
  ): Promise<ClassCourseResDto> {
    const classRow = await this.getClassBaseRow(classCode);
    const courseRow = await this.db.query.courses.findFirst({
      where: eq(courses.id, reqDto.courseId),
      columns: {
        id: true,
      },
    });

    if (!courseRow) {
      throw new AppException(
        ErrorCode.E002,
        'Course not found',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.db.transaction(async (tx) => {
      const [insertedClassCourse] = await tx
        .insert(classCourses)
        .values({
          classId: classRow.id,
          courseId: reqDto.courseId,
          required: reqDto.required,
        })
        .onConflictDoNothing({
          target: [classCourses.classId, classCourses.courseId],
        })
        .returning({
          id: classCourses.id,
        });

      if (!insertedClassCourse) {
        throw new AppException(
          ErrorCode.E001,
          'Class course already exists',
          HttpStatus.CONFLICT,
        );
      }
    });

    return this.getClassCourse(classRow.id, reqDto.courseId);
  }

  async getSessions(classCode: string): Promise<ClassSessionResDto[]> {
    const classRow = await this.getClassBaseRow(classCode);

    return this.getClassSessionsByClassId(classRow.id);
  }

  async getEnrollments(classCode: string): Promise<ClassEnrollmentResDto[]> {
    const classRow = await this.getClassBaseRow(classCode);
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
      .innerJoin(users, eq(users.id, classEnrollments.learnerId))
      .where(eq(classEnrollments.classId, classRow.id))
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
    const classRow = await this.getClassBaseRow(classCode);
    const student = await this.db.query.users.findFirst({
      where: and(eq(users.email, reqDto.email), eq(users.role, Role.STUDENT)),
      columns: {
        id: true,
      },
    });

    if (!student) {
      throw new AppException(
        ErrorCode.E002,
        'Student not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const existingEnrollment = await this.db.query.classEnrollments.findFirst({
      where: and(
        eq(classEnrollments.classId, classRow.id),
        eq(classEnrollments.learnerId, student.id),
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
        'Student already joined this class',
        HttpStatus.CONFLICT,
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
          classId: classRow.id,
          learnerId: student.id,
          source: ClassEnrollmentSource.INVITE,
          status: ClassEnrollmentStatus.PENDING,
          note: reqDto.note,
        })
        .returning({
          id: classEnrollments.id,
        });

      return createdEnrollment.id;
    });

    return this.getClassEnrollment(classRow.id, enrollmentId);
  }

  async updateEnrollmentStatus(
    classCode: string,
    enrollmentId: string,
    reqDto: UpdateClassEnrollmentStatusReqDto,
  ): Promise<ClassEnrollmentResDto> {
    const classRow = await this.getClassBaseRow(classCode);
    const [updatedEnrollment] = await this.db
      .update(classEnrollments)
      .set({
        status: reqDto.status,
        reviewedAt:
          reqDto.status === ClassEnrollmentStatus.PENDING ? null : new Date(),
      })
      .where(
        and(
          eq(classEnrollments.id, enrollmentId),
          eq(classEnrollments.classId, classRow.id),
        ),
      )
      .returning({
        id: classEnrollments.id,
      });

    if (!updatedEnrollment) {
      throw new AppException(
        ErrorCode.E002,
        'Class enrollment not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.getClassEnrollment(classRow.id, updatedEnrollment.id);
  }

  private async getClassBaseRow(classCode: string): Promise<ClassBaseRow> {
    const [classRow] = await this.db
      .select({
        id: classes.id,
        code: classes.code,
        name: classes.name,
        instructor: {
          id: users.id,
          email: users.email,
          username: users.username,
          fullName: users.fullName,
          role: users.role,
          isLocked: users.isLocked,
          createdAt: users.createdAt,
          profileUserId: userProfiles.userId,
          profilePhone: userProfiles.phone,
          profileLocation: userProfiles.location,
          profileBio: userProfiles.bio,
          profileAvatarUrl: userProfiles.avatarUrl,
          profileCreatedAt: userProfiles.createdAt,
          profileUpdatedAt: userProfiles.updatedAt,
        },
        maxStudents: classes.maxStudents,
        meetingUrl: classes.meetingUrl,
        startDate: classes.startDate,
        endDate: classes.endDate,
        startTime: classes.startTime,
        endTime: classes.endTime,
        repeatDays: classes.repeatDays,
        status: classes.status,
        format: classes.format,
        joinPolicy: classes.joinPolicy,
        waitlistEnabled: classes.waitlistEnabled,
        reminderEnabled: classes.reminderEnabled,
        autoCreateSessions: classes.autoCreateSessions,
        note: classes.note,
      })
      .from(classes)
      .innerJoin(users, eq(users.id, classes.instructorId))
      .innerJoin(userProfiles, eq(userProfiles.userId, users.id))
      .where(eq(classes.code, classCode))
      .limit(1);

    if (!classRow) {
      throw new AppException(
        ErrorCode.E002,
        'Class not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      ...classRow,
      instructor: {
        id: classRow.instructor.id,
        email: classRow.instructor.email,
        username: classRow.instructor.username,
        fullName: classRow.instructor.fullName,
        role: classRow.instructor.role,
        permissionCodes: getPermissionCodesByRole(classRow.instructor.role),
        isLocked: classRow.instructor.isLocked,
        createdAt: classRow.instructor.createdAt,
        profile: {
          userId: classRow.instructor.profileUserId,
          phone: classRow.instructor.profilePhone,
          location: classRow.instructor.profileLocation,
          bio: classRow.instructor.profileBio,
          avatarUrl: classRow.instructor.profileAvatarUrl,
          createdAt: classRow.instructor.profileCreatedAt,
          updatedAt: classRow.instructor.profileUpdatedAt,
        },
      },
    };
  }

  private async getActiveLearners(
    classRow: ClassBaseRow,
  ): Promise<ClassLearnerResDto[]> {
    const entities = await this.db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        isLocked: users.isLocked,
        createdAt: users.createdAt,
      })
      .from(classEnrollments)
      .innerJoin(users, eq(users.id, classEnrollments.learnerId))
      .where(
        and(
          eq(classEnrollments.classId, classRow.id),
          eq(classEnrollments.status, ClassEnrollmentStatus.ACTIVE),
        ),
      )
      .orderBy(asc(users.fullName));

    return plainToInstance(ClassLearnerResDto, entities);
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
        'Class enrollment not found',
        HttpStatus.NOT_FOUND,
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
  ): Promise<ClassCourseResDto> {
    const [courseRow] = await this.db
      .select({
        courseId: courses.id,
        courseCode: courses.code,
        courseName: courses.name,
        lessonCount: sql<number>`count(${courseLessons.id})`.mapWith(Number),
        required: classCourses.required,
      })
      .from(classCourses)
      .innerJoin(courses, eq(courses.id, classCourses.courseId))
      .leftJoin(courseLessons, eq(courseLessons.courseId, courses.id))
      .where(
        and(
          eq(classCourses.classId, classId),
          eq(classCourses.courseId, courseId),
        ),
      )
      .groupBy(classCourses.id, courses.id)
      .limit(1);

    if (!courseRow) {
      throw new AppException(
        ErrorCode.E002,
        'Class course not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return plainToInstance(ClassCourseResDto, {
      ...courseRow,
      completedLessons: 0,
    });
  }

  private async getClassCoursesByClassId(
    classId: string,
  ): Promise<ClassCourseResDto[]> {
    const courseRows = await this.db
      .select({
        courseId: courses.id,
        courseCode: courses.code,
        courseName: courses.name,
        lessonCount: sql<number>`count(${courseLessons.id})`.mapWith(Number),
        required: classCourses.required,
      })
      .from(classCourses)
      .innerJoin(courses, eq(courses.id, classCourses.courseId))
      .leftJoin(courseLessons, eq(courseLessons.courseId, courses.id))
      .where(eq(classCourses.classId, classId))
      .groupBy(classCourses.id, courses.id)
      .orderBy(asc(courses.name));

    return plainToInstance(
      ClassCourseResDto,
      courseRows.map((courseRow) => ({
        ...courseRow,
        completedLessons: 0,
      })),
    );
  }

  private async getClassSessionsByClassId(
    classId: string,
  ): Promise<ClassSessionResDto[]> {
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
      .leftJoin(courses, eq(courses.id, classSessions.courseId))
      .leftJoin(users, eq(users.id, classSessions.instructorId))
      .where(eq(classSessions.classId, classId))
      .groupBy(classSessions.id, courses.id, users.id)
      .orderBy(asc(classSessions.sessionDate), asc(classSessions.startTime));

    return plainToInstance(
      ClassSessionResDto,
      sessionRows.map((sessionRow) => this.mapClassSessionRow(sessionRow)),
    );
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

  private buildAutoSessionRows(
    classId: string,
    reqDto: CreateClassReqDto,
    courseId: string | null,
  ): NewClassSession[] {
    if (
      !reqDto.autoCreateSessions ||
      !reqDto.startDate ||
      !reqDto.endDate ||
      reqDto.repeatDays.length === 0
    ) {
      return [];
    }

    const startDate = this.parseDate(reqDto.startDate);
    const endDate = this.parseDate(reqDto.endDate);

    if (!startDate || !endDate || startDate > endDate) {
      return [];
    }

    const repeatDays = new Set<ClassWeekday>(reqDto.repeatDays);
    const sessionRows: NewClassSession[] = [];
    const currentDate = new Date(startDate);
    const maxAutoSessionCount = 120;

    while (currentDate <= endDate && sessionRows.length < maxAutoSessionCount) {
      const weekday = this.getWeekday(currentDate);

      if (repeatDays.has(weekday)) {
        const position = sessionRows.length + 1;

        sessionRows.push({
          classId,
          courseId,
          instructorId: reqDto.instructorId,
          code: `S${position.toString().padStart(3, '0')}`,
          title: `Buoi hoc ${position}`,
          sessionDate: this.formatDate(currentDate),
          startTime: reqDto.startTime,
          endTime: reqDto.endTime,
          status: ClassSessionStatus.SCHEDULED,
          position,
        });
      }

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return sessionRows;
  }

  private getRequestedCourseIds(reqDto: CreateClassReqDto): string[] {
    return Array.from(
      new Set([
        ...(reqDto.courseId ? [reqDto.courseId] : []),
        ...(reqDto.courseIds ?? []),
      ]),
    );
  }

  private parseDate(dateValue: string): Date | null {
    const date = new Date(`${dateValue}T00:00:00.000Z`);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  private getWeekday(date: Date): ClassWeekday {
    const weekdayMap = [
      ClassWeekday.SUNDAY,
      ClassWeekday.MONDAY,
      ClassWeekday.TUESDAY,
      ClassWeekday.WEDNESDAY,
      ClassWeekday.THURSDAY,
      ClassWeekday.FRIDAY,
      ClassWeekday.SATURDAY,
    ];

    return weekdayMap[date.getUTCDay()];
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
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
