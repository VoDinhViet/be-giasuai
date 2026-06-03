import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AppException } from '../../exceptions/app.exception';
import { ErrorCode } from '../../constants/error-code.constant';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.type';
import { users } from '../../database/schemas/users';
import { sessions } from '../../database/schemas/sessions';
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { GetUsersDto } from './dto/get-users.dto';
import { PageOptionsDto } from '../../common/offset-pagination/page-options.dto';
import { OffsetPaginatedDto } from '../../common/offset-pagination/paginated.dto';
import { OffsetPaginationDto } from '../../common/offset-pagination/offset-pagination.dto';
import { UserResDto } from './dto/user.res.dto';
import { plainToInstance } from 'class-transformer';
import { OrderBy } from '../../constants/app.constant';
import { UserStatsResDto } from './dto/user-stats.res.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../../constants/role.constant';
import { ToggleUserLockReqDto } from './dto/toggle-user-lock.req.dto';
import { UpdateCurrentUserReqDto } from './dto/update-current-user.req.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) {}

  async getUsers(
    pageOptions: GetUsersDto,
  ): Promise<OffsetPaginatedDto<UserResDto>> {
    const conditions: SQL[] = [];

    if (pageOptions.q) {
      const q = or(
        ilike(users.email, `%${pageOptions.q}%`),
        ilike(users.username, `%${pageOptions.q}%`),
        ilike(users.fullName, `%${pageOptions.q}%`),
      );
      if (q) conditions.push(q);
    }

    if (pageOptions.role) {
      conditions.push(eq(users.role, pageOptions.role));
    }

    if (pageOptions.isLocked !== undefined) {
      conditions.push(eq(users.isLocked, pageOptions.isLocked));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const orderBy =
      pageOptions.order === OrderBy.ASC
        ? asc(users.createdAt)
        : desc(users.createdAt);

    const [userRows, [{ total }]] = await Promise.all([
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
        .from(users)
        .where(where)
        .orderBy(orderBy)
        .limit(pageOptions.limit)
        .offset(pageOptions.offset),
      this.db.select({ total: count() }).from(users).where(where),
    ]);

    return new OffsetPaginatedDto(
      plainToInstance(UserResDto, userRows),
      new OffsetPaginationDto(total, pageOptions),
    );
  }

  async findOne(userId: string): Promise<UserResDto> {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        isLocked: users.isLocked,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new AppException(
        ErrorCode.E002,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return plainToInstance(UserResDto, user);
  }

  async updateCurrentUser(
    userId: string,
    reqDto: UpdateCurrentUserReqDto,
  ): Promise<UserResDto> {
    if (reqDto.fullName === undefined) {
      return this.findOne(userId);
    }

    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
      },
    });

    if (!existingUser) {
      throw new AppException(
        ErrorCode.E002,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const [updatedUser] = await this.db
      .update(users)
      .set({
        fullName: reqDto.fullName,
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        isLocked: users.isLocked,
        createdAt: users.createdAt,
      });

    return plainToInstance(UserResDto, updatedUser);
  }

  /**
   * Lấy thống kê tổng quan về người dùng.
   * Bao gồm: tổng số người dùng, người dùng mới trong ngày, người dùng hoạt động (24h qua) và người dùng bị khóa.
   *
   * @returns Thống kê người dùng (tổng số, mới, hoạt động, bị khóa).
   */
  async getStats(): Promise<UserStatsResDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);

    const [[{ total }], [{ newUsers }], [{ activeUsers }], [{ lockedUsers }]] =
      await Promise.all([
        this.db.select({ total: count() }).from(users),
        this.db
          .select({ newUsers: count() })
          .from(users)
          .where(gte(users.createdAt, today)),
        this.db
          .select({ activeUsers: count(sql`DISTINCT ${sessions.userId}`) })
          .from(sessions)
          .where(gte(sessions.updatedAt, last24h)),
        this.db
          .select({ lockedUsers: count() })
          .from(users)
          .where(eq(users.isLocked, true)),
      ]);
    return {
      total: Number(total),
      new: Number(newUsers),
      active: Number(activeUsers),
      locked: Number(lockedUsers),
    };
  }

  /**
   * Cập nhật trạng thái khóa/mở khóa của tài khoản người dùng.
   *
   * @param userId - ID của người dùng cần cập nhật.
   * @param isLocked - Trạng thái khóa mới (true để khóa, false để mở khóa).
   * @returns Promise<void>
   */
  async toggleLock(
    userId: string,
    reqDto: ToggleUserLockReqDto,
  ): Promise<void> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
      },
    });

    if (!user) {
      throw new AppException(
        ErrorCode.E002,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ isLocked: reqDto.isLocked })
        .where(eq(users.id, userId));

      if (reqDto.isLocked) {
        await tx.delete(sessions).where(eq(sessions.userId, userId));
      }
    });
  }

  async verifyTeacher(userId: string): Promise<UserResDto> {
    const teacher = await this.db.query.users.findFirst({
      where: and(eq(users.id, userId), eq(users.role, Role.TEACHER)),
      columns: {
        id: true,
      },
    });

    if (!teacher) {
      throw new AppException(
        ErrorCode.E009,
        'Teacher not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const [verifiedTeacher] = await this.db
      .update(users)
      .set({ isLocked: false })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        isLocked: users.isLocked,
        createdAt: users.createdAt,
      });

    return plainToInstance(UserResDto, verifiedTeacher);
  }

  /**
   * Xóa một người dùng khỏi hệ thống.
   *
   * @param userId - ID của người dùng cần xóa.
   * @returns Promise<void>
   * @throws {AppException} Nếu không tìm thấy người dùng (E002).
   */
  async delete(userId: string): Promise<void> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new AppException(
        ErrorCode.E002,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.db.delete(users).where(eq(users.id, userId));
  }

  async create(dto: CreateUserDto): Promise<UserResDto> {
    const existingUser = await this.db.query.users.findFirst({
      where: or(eq(users.email, dto.email), eq(users.username, dto.username)),
      columns: {
        id: true,
      },
    });

    if (existingUser) {
      throw new AppException(
        ErrorCode.E001,
        'User with this email or username already exists',
        HttpStatus.CONFLICT,
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const [createdUser] = await this.db
      .insert(users)
      .values({
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        fullName: dto.fullName,
        role: dto.role,
      })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        isLocked: users.isLocked,
        createdAt: users.createdAt,
      });

    return plainToInstance(UserResDto, createdUser);
  }
}
