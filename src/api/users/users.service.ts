import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AppException } from '..\../exceptions/app.exception';
import { ErrorCode } from '..\../constants/error-code.constant';
import { DRIZZLE } from '..\../database/database.module';
import type { Database } from '..\../database/database.type';
import { users } from '..\../database/schemas/users';
import { sessions } from '..\../database/schemas/sessions';
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
import { PageOptionsDto } from '..\../common/offset-pagination/page-options.dto';
import { OffsetPaginatedDto } from '..\../common/offset-pagination/paginated.dto';
import { OffsetPaginationDto } from '..\../common/offset-pagination/offset-pagination.dto';
import { UserResDto } from './dto/user.res.dto';
import { plainToInstance } from 'class-transformer';
import { OrderBy } from '..\../constants/app.constant';
import { UserStatsResDto } from './dto/user-stats.res.dto';
import { LockUserDto } from './dto/lock-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

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

    return plainToInstance(UserResDto, user);
  }

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
    console.log(total);
    console.log(newUsers);
    console.log(activeUsers);
    console.log(lockedUsers);
    return {
      total: Number(total),
      new: Number(newUsers),
      active: Number(activeUsers),
      locked: Number(lockedUsers),
    };
  }

  async toggleLock(userId: string, lockUserDto: LockUserDto): Promise<void> {
    await this.db
      .update(users)
      .set({ isLocked: lockUserDto.isLocked })
      .where(eq(users.id, userId));
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
