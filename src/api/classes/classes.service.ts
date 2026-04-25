import { randomBytes } from 'crypto';

import { Inject, Injectable, HttpStatus } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  ilike,
  or,
  sql,
  SQL,
} from 'drizzle-orm';

import { JwtPayloadType } from '@/api/auth/types/jwt-payload.type';
import { PageOptionsDto } from '@/common/offset-pagination/page-options.dto';
import { OffsetPaginatedDto } from '@/common/offset-pagination/paginated.dto';
import { OffsetPaginationDto } from '@/common/offset-pagination/offset-pagination.dto';
import { OrderBy } from '@/constants/app.constant';
import { ErrorCode } from '@/constants/error-code.constant';
import { Role } from '@/constants/role.constant';
import { DRIZZLE } from '@/database/database.module';
import type { Database } from '@/database/database.type';
import {
  classCourses,
  classEnrollments,
  classes,
  courses,
  users,
} from '@/database/schemas';
import { AppException } from '@/exceptions/app.exception';

import { ClassDetailResDto } from './dto/class-detail.res.dto';
import { ClassResDto } from './dto/class.res.dto';
import { CreateClassReqDto } from './dto/create-class.req.dto';
import { GetClassesReqDto } from './dto/get-classes.req.dto';
import { UpdateClassReqDto } from './dto/update-class.req.dto';
import { JoinClassReqDto } from './dto/join-class.req.dto';
import { ClassStatisticsResDto } from './dto/class-statistics.res.dto';
import { ClassDetailStatisticsResDto } from './dto/class-detail-statistics.res.dto';
import { CourseResDto } from '../courses/dto/course.res.dto';
import { UserResDto } from '../users/dto/user.res.dto';

@Injectable()
export class ClassesService {
  private static readonly CREATE_CLASS_MAX_ATTEMPTS = 10;

  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) { }

  /**
   * Tạo một lớp học mới.
   * Hệ thống sẽ tự động tạo mã lớp (code) và mã mời (inviteCode) duy nhất.
   * Sử dụng cơ chế retry với `.onConflictDoNothing()` để đảm bảo không bị trùng mã.
   *
   * @param reqDto - Dữ liệu tạo lớp học (tên, mô tả).
   * @param payload - Thông tin người dùng từ JWT (để gán teacherId).
   * @returns Thông tin lớp học vừa tạo.
   * @throws {AppException} Nếu không thể tạo mã duy nhất sau số lần thử tối đa (E104).
   */
  async createClass(
    reqDto: CreateClassReqDto,
    payload: JwtPayloadType,
  ): Promise<ClassResDto> {
    for (
      let attempt = 0;
      attempt < ClassesService.CREATE_CLASS_MAX_ATTEMPTS;
      attempt += 1
    ) {
      const result = await this.db
        .insert(classes)
        .values({
          name: reqDto.name,
          description: reqDto.description,
          teacherId: payload.userId,
          code: this.generateCode('CLS'),
          inviteCode: this.generateCode('INV'),
        })
        .onConflictDoNothing()
        .returning();

      if (result.length > 0) {
        return plainToInstance(ClassResDto, result[0]);
      }
    }

    throw new AppException(
      ErrorCode.E104,
      'Failed to generate unique class code after max attempts',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async getClasses(
    pageOptions: GetClassesReqDto,
    payload: JwtPayloadType,
  ): Promise<OffsetPaginatedDto<ClassResDto>> {
    const searchFilter = pageOptions.q
      ? or(
        ilike(classes.name, `%${pageOptions.q}%`),
        ilike(classes.code, `%${pageOptions.q}%`),
      )
      : undefined;


    const filters = [searchFilter];

    if (pageOptions.isActive !== undefined) {
      filters.push(eq(classes.isActive, pageOptions.isActive));
    }

    if (payload.role === Role.TEACHER) {
      filters.push(eq(classes.teacherId, payload.userId));
    }

    if (payload.role === Role.USER) {
      filters.push(
        sql`EXISTS (
            SELECT 1 FROM ${classEnrollments} 
            WHERE ${classEnrollments.classId} = ${classes.id} 
            AND ${classEnrollments.studentId} = ${payload.userId}
            AND ${classEnrollments.status} = 'active'
          )`,
      );
    }

    const where = and(...filters);

    const orderBy =
      pageOptions.order === OrderBy.ASC
        ? asc(classes.createdAt)
        : desc(classes.createdAt);

    const [rows, [{ total }]] = await Promise.all([
      this.db
        .select({
          id: classes.id,
          name: classes.name,
          code: classes.code,
          inviteCode: classes.inviteCode,
          teacherId: classes.teacherId,
          description: classes.description,
          isActive: classes.isActive,
          createdAt: classes.createdAt,
          updatedAt: classes.updatedAt,
          teacher: {
            id: users.id,
            email: users.email,
            username: users.username,
            fullName: users.fullName,
            role: users.role,
            isLocked: users.isLocked,
            createdAt: users.createdAt,
          },
        })
        .from(classes)
        .leftJoin(users, eq(classes.teacherId, users.id))
        .where(where)
        .orderBy(orderBy)
        .limit(pageOptions.limit)
        .offset(pageOptions.offset),
      this.db.select({ total: count() }).from(classes).where(where),
    ]);

    const data = rows.map((row) => ({
      ...row,
      teacher: row.teacher?.id ? row.teacher : null,
    }));

    return new OffsetPaginatedDto(
      plainToInstance(ClassResDto, data),
      new OffsetPaginationDto(total, pageOptions),
    );
  }

  async getStatistics(payload: JwtPayloadType): Promise<ClassStatisticsResDto> {
    let roleFilter: SQL | undefined;

    switch (payload.role) {
      case Role.TEACHER:
        roleFilter = eq(classes.teacherId, payload.userId);
        break;
      case Role.ADMIN:
      default:
        roleFilter = undefined;
        break;
    }

    const where = roleFilter;
    const [stats] = await this.db
      .select({
        totalClasses: countDistinct(classes.id),
        activeClasses: sql<number>`count(distinct case when ${classes.isActive} = true then ${classes.id} end)`,
        pausedClasses: sql<number>`count(distinct case when ${classes.isActive} = false then ${classes.id} end)`,
        totalStudents: count(classEnrollments.studentId),
      })
      .from(classes)
      .leftJoin(
        classEnrollments,
        and(
          eq(classes.id, classEnrollments.classId),
          eq(classEnrollments.status, 'active'),
        ),
      )
      .where(where);

    return plainToInstance(ClassStatisticsResDto, {
      totalClasses: Number(stats?.totalClasses || 0),
      activeClasses: Number(stats?.activeClasses || 0),
      pausedClasses: Number(stats?.pausedClasses || 0),
      totalStudents: Number(stats?.totalStudents || 0),
    });
  }

  async getClassByCode(code: string): Promise<ClassResDto> {
    const classItem = await this.db.query.classes.findFirst({
      where: eq(classes.inviteCode, code),
      with: {
        teacher: true,
      },
    });

    if (!classItem) {
      throw new AppException(
        ErrorCode.E105,
        'Class not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return plainToInstance(ClassResDto, {
      ...classItem,
      teacher: classItem.teacher?.id ? classItem.teacher : null,
    });
  }

  async getClass(
    classId: string,
    payload: JwtPayloadType,
  ): Promise<ClassDetailResDto> {

    const classItem = await this.db.query.classes.findFirst({
      where: eq(classes.id, classId),
      with: {
        teacher: true,
      },
    });

    if (!classItem) {
      throw new AppException(
        ErrorCode.E105,
        'Class not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      payload.role === Role.TEACHER &&
      classItem.teacherId !== payload.userId
    ) {
      throw new AppException(
        ErrorCode.E103,
        'You do not have permission to view this class',
        HttpStatus.FORBIDDEN,
      );
    }

    if (payload.role === Role.USER && classItem.teacherId !== payload.userId) {
      const enrollment = await this.db.query.classEnrollments.findFirst({
        where: and(
          eq(classEnrollments.classId, classId),
          eq(classEnrollments.studentId, payload.userId),
          eq(classEnrollments.status, 'active'),
        ),
      });

      if (!enrollment) {
        throw new AppException(
          ErrorCode.E103,
          'You are not enrolled in this class',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    const students = await this.db
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
      .innerJoin(users, eq(classEnrollments.studentId, users.id))
      .where(
        and(
          eq(classEnrollments.classId, classId),
          eq(classEnrollments.status, 'active'),
        ),
      )
      .orderBy(asc(users.fullName), asc(users.createdAt));

    return plainToInstance(ClassDetailResDto, {
      ...classItem,
      teacher: classItem.teacher ?? null,
      studentCount: students.length,
      students: plainToInstance(UserResDto, students),
    });
  }

  async getClassDetailStats(
    classId: string,
    payload: JwtPayloadType,
  ): Promise<ClassDetailStatisticsResDto> {

    const classItem = await this.db.query.classes.findFirst({
      where: eq(classes.id, classId),
    });

    if (!classItem) {
      throw new AppException(
        ErrorCode.E105,
        'Class not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Authorization check (same as getClass)
    if (
      payload.role === Role.TEACHER &&
      classItem.teacherId !== payload.userId
    ) {
      throw new AppException(
        ErrorCode.E103,
        'You do not have permission to view this class',
        HttpStatus.FORBIDDEN,
      );
    }

    if (payload.role === Role.USER && classItem.teacherId !== payload.userId) {
      const enrollment = await this.db.query.classEnrollments.findFirst({
        where: and(
          eq(classEnrollments.classId, classId),
          eq(classEnrollments.studentId, payload.userId),
          eq(classEnrollments.status, 'active'),
        ),
      });

      if (!enrollment) {
        throw new AppException(
          ErrorCode.E103,
          'You are not enrolled in this class',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    const [stats, courseStats] = await Promise.all([
      this.db
        .select({
          studentCount: count(classEnrollments.studentId),
        })
        .from(classEnrollments)
        .where(
          and(
            eq(classEnrollments.classId, classId),
            eq(classEnrollments.status, 'active'),
          ),
        ),
      this.db
        .select({
          courseCount: count(classCourses.id),
        })
        .from(classCourses)
        .where(eq(classCourses.classId, classId)),
    ]);

    return plainToInstance(ClassDetailStatisticsResDto, {
      studentCount: Number(stats[0]?.studentCount || 0),
      courseCount: Number(courseStats[0]?.courseCount || 0),
      inviteCode: classItem.inviteCode,
      isActive: classItem.isActive,
    });
  }

  async updateClass(
    classId: string,
    dto: UpdateClassReqDto,
    payload: JwtPayloadType,
  ): Promise<ClassResDto> {

    const classItem = await this.db.query.classes.findFirst({
      where: eq(classes.id, classId),
    });

    if (!classItem) {
      throw new AppException(
        ErrorCode.E105,
        'Class not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Authorization check
    if (
      (payload.role === Role.TEACHER || payload.role === Role.USER) &&
      classItem.teacherId !== payload.userId
    ) {
      throw new AppException(
        ErrorCode.E103,
        'You do not have permission to update this class',
        HttpStatus.FORBIDDEN,
      );
    }


    const [updatedClass] = await this.db
      .update(classes)
      .set({
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive,
      })
      .where(eq(classes.id, classId))
      .returning({
        id: classes.id,
        name: classes.name,
        code: classes.code,
        inviteCode: classes.inviteCode,
        teacherId: classes.teacherId,
        description: classes.description,
        isActive: classes.isActive,
        createdAt: classes.createdAt,
        updatedAt: classes.updatedAt,
      });

    return plainToInstance(ClassResDto, updatedClass);
  }

  async deleteClass(classId: string, payload: JwtPayloadType): Promise<void> {

    const classItem = await this.db.query.classes.findFirst({
      where: eq(classes.id, classId),
    });

    if (!classItem) {
      throw new AppException(
        ErrorCode.E105,
        'Class not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Authorization check: Only Admin or the assigned Teacher/Owner can delete
    if (
      (payload.role === Role.TEACHER || payload.role === Role.USER) &&
      classItem.teacherId !== payload.userId
    ) {
      throw new AppException(
        ErrorCode.E103,
        'You do not have permission to delete this class',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.db.delete(classes).where(eq(classes.id, classId));
  }

  async joinClass(
    inviteCode: string,
    payload: JwtPayloadType,
  ): Promise<void> {
    const classItem = await this.db.query.classes.findFirst({
      where: eq(classes.inviteCode, inviteCode),
      columns: { id: true, isActive: true },
    });

    if (!classItem) {
      throw new AppException(
        ErrorCode.E105,
        'Class not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!classItem.isActive) {
      throw new AppException(
        ErrorCode.E103,
        'This class is no longer active',
        HttpStatus.FORBIDDEN,
      );
    }

    // Check if already joined
    const existing = await this.db.query.classEnrollments.findFirst({
      where: and(
        eq(classEnrollments.classId, classItem.id),
        eq(classEnrollments.studentId, payload.userId),
      ),
    });

    if (existing) {
      if (existing.status !== 'active') {
        await this.db
          .update(classEnrollments)
          .set({
            status: 'active',
            enrolledAt: new Date(),
          })
          .where(eq(classEnrollments.id, existing.id));
      }

      return;
    }

    await this.db.insert(classEnrollments).values({
      classId: classItem.id,
      studentId: payload.userId,
      status: 'active',
    });
  }

  async getStudents(
    classId: string,
    pageOptions: PageOptionsDto,
    payload: JwtPayloadType,
  ): Promise<OffsetPaginatedDto<UserResDto>> {

    const classItem = await this.db.query.classes.findFirst({
      where: eq(classes.id, classId),
    });

    if (!classItem) {
      throw new AppException(
        ErrorCode.E105,
        'Class not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      (payload.role === Role.TEACHER || payload.role === Role.USER) &&
      classItem.teacherId !== payload.userId
    ) {
      throw new AppException(
        ErrorCode.E103,
        'You do not have permission to view students of this class',
        HttpStatus.FORBIDDEN,
      );
    }

    const orderBy =
      pageOptions.order === OrderBy.ASC
        ? asc(users.createdAt)
        : desc(users.createdAt);

    const [students, [{ total }]] = await Promise.all([
      this.db
        .select({
          userId: users.id,
          email: users.email,
          username: users.username,
          fullName: users.fullName,
          role: users.role,
          isLocked: users.isLocked,
          createdAt: users.createdAt,
        })
        .from(classEnrollments)
        .innerJoin(users, eq(classEnrollments.studentId, users.id))
        .where(
          and(
            eq(classEnrollments.classId, classId),
            eq(classEnrollments.status, 'active'),
          ),
        )
        .orderBy(orderBy)
        .limit(pageOptions.limit)
        .offset(pageOptions.offset),
      this.db
        .select({ total: count() })
        .from(classEnrollments)
        .where(
          and(
            eq(classEnrollments.classId, classId),
            eq(classEnrollments.status, 'active'),
          ),
        ),
    ]);

    return new OffsetPaginatedDto(
      plainToInstance(UserResDto, students),
      new OffsetPaginationDto(total, pageOptions),
    );
  }

  async getCoursesByClass(
    classId: string,
    pageOptions: PageOptionsDto,
    payload: JwtPayloadType,
  ): Promise<OffsetPaginatedDto<CourseResDto>> {
    await this.ensureClassAccessible(classId, payload);

    const orderBy =
      pageOptions.order === OrderBy.ASC
        ? asc(classCourses.assignedAt)
        : desc(classCourses.assignedAt);

    const [rows, [{ total }]] = await Promise.all([
      this.db
        .select({
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
        })
        .from(classCourses)
        .innerJoin(courses, eq(classCourses.courseId, courses.id))
        .where(
          and(
            eq(classCourses.classId, classId),
            pageOptions.q
              ? or(
                  ilike(courses.title, `%${pageOptions.q}%`),
                  ilike(courses.slug, `%${pageOptions.q}%`),
                  ilike(courses.description, `%${pageOptions.q}%`),
                )
              : undefined,
            payload.role === Role.USER ? eq(courses.isPublished, true) : undefined,
          ),
        )
        .orderBy(orderBy)
        .limit(pageOptions.limit)
        .offset(pageOptions.offset),
      this.db
        .select({ total: count() })
        .from(classCourses)
        .innerJoin(courses, eq(classCourses.courseId, courses.id))
        .where(
          and(
            eq(classCourses.classId, classId),
            pageOptions.q
              ? or(
                  ilike(courses.title, `%${pageOptions.q}%`),
                  ilike(courses.slug, `%${pageOptions.q}%`),
                  ilike(courses.description, `%${pageOptions.q}%`),
                )
              : undefined,
            payload.role === Role.USER ? eq(courses.isPublished, true) : undefined,
          ),
        ),
    ]);

    return new OffsetPaginatedDto(
      plainToInstance(CourseResDto, rows),
      new OffsetPaginationDto(total, pageOptions),
    );
  }

  async getAssignedCourseIds(
    classId: string,
    payload: JwtPayloadType,
  ): Promise<string[]> {
    await this.ensureClassAccessible(classId, payload);

    const rows = await this.db
      .select({ courseId: classCourses.courseId })
      .from(classCourses)
      .where(eq(classCourses.classId, classId));

    return rows.map((r) => r.courseId);
  }

  /**
   * Gán một khóa học vào một lớp học cụ thể.
   *
   * Điều kiện ràng buộc:
   * - Chỉ giáo viên sở hữu lớp (teacherId) mới được phép thực hiện hành động này.
   * - Giáo viên chỉ có thể thêm khóa học cho chính lớp mà mình sở hữu.
   *
   * @param classId - ID của lớp học.
   * @param courseId - ID của khóa học cần gán.
   * @param payload - Thông tin payload của JWT (chứa userId và role).
   * @throws {AppException} Nếu không phải giáo viên sở hữu lớp (Mã lỗi: E103).
   * @throws {AppException} Nếu khóa học không tồn tại (Mã lỗi: E105).
   * @throws {AppException} Nếu lớp học không tồn tại (Mã lỗi: E105).
   */
  async assignCourseToClass(
    classId: string,
    courseId: string,
    payload: JwtPayloadType,
  ): Promise<void> {
    await this.ensureTeacherOwnsClass(classId, payload.userId);
    await this.ensureCourseExists(courseId);

    await this.db
      .insert(classCourses)
      .values({
        classId,
        courseId,
        assignedBy: payload.userId,
      })
      .onConflictDoNothing();
  }


  /**
   * Tạo mã ngẫu nhiên với tiền tố xác định.
   * Sử dụng crypto.randomBytes để đảm bảo tính ngẫu nhiên cao.
   *
   * @param prefix - Tiền tố của mã ('CLS' cho lớp học, 'INV' cho mã mời).
   * @returns Chuỗi mã đã được viết hoa (ví dụ: CLS-A1B2C3D4).
   */
  private generateCode(prefix: 'CLS' | 'INV'): string {
    return `${prefix}-${randomBytes(4).toString('hex').toUpperCase()}`;
  }


  /**
   * Xác thực quyền sở hữu của giáo viên đối với một lớp học.
   * Kiểm tra xem lớp học có tồn tại và giáo viên có phải là người quản lý lớp đó không.
   *
   * @param classId - ID của lớp học cần kiểm tra.
   * @param teacherId - ID của giáo viên cần xác thực.
   * @returns Thông tin lớp học nếu hợp lệ.
   * @throws {AppException} Nếu lớp học không tồn tại (E105) hoặc giáo viên không có quyền (E103).
   */
  private async ensureTeacherOwnsClass(classId: string, teacherId: string) {
    const classItem = await this.db.query.classes.findFirst({
      where: eq(classes.id, classId),
      columns: {
        id: true,
        teacherId: true,
      },
    });

    if (!classItem) {
      throw new AppException(
        ErrorCode.E105,
        'Class not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (classItem.teacherId !== teacherId) {
      throw new AppException(
        ErrorCode.E103,
        'You do not have permission to manage this class',
        HttpStatus.FORBIDDEN,
      );
    }

    return classItem;
  }

  /**
   * Kiểm tra sự tồn tại của một khóa học.
   *
   * @param courseId - ID của khóa học cần kiểm tra.
   * @returns Thông tin khóa học nếu tồn tại.
   * @throws {AppException} Nếu không tìm thấy khóa học (Mã lỗi: E105).
   */
  private async ensureCourseExists(courseId: string) {
    const course = await this.db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      columns: { id: true },
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

  private async ensureClassAccessible(
    classId: string,
    payload: JwtPayloadType,
  ) {
    const classItem = await this.db.query.classes.findFirst({
      where: eq(classes.id, classId),
      columns: {
        id: true,
        teacherId: true,
      },
    });

    if (!classItem) {
      throw new AppException(
        ErrorCode.E105,
        'Class not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (payload.role === Role.ADMIN) {
      return classItem;
    }

    if (payload.role === Role.TEACHER && classItem.teacherId === payload.userId) {
      return classItem;
    }

    if (payload.role === Role.USER && classItem.teacherId !== payload.userId) {
      const enrollment = await this.db.query.classEnrollments.findFirst({
        where: and(
          eq(classEnrollments.classId, classId),
          eq(classEnrollments.studentId, payload.userId),
          eq(classEnrollments.status, 'active'),
        ),
        columns: { id: true },
      });

      if (enrollment) {
        return classItem;
      }
    }

    throw new AppException(
      ErrorCode.E103,
      'You do not have permission to view this class',
      HttpStatus.FORBIDDEN,
    );
  }

}
