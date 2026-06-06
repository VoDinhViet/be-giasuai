import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AppException } from '../../exceptions/app.exception';
import { ErrorCode } from '../../constants/error-code.constant';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.type';
import { users } from '../../database/schemas/users';
import { sessions } from '../../database/schemas/sessions';
import { userProfiles } from '../../database/schemas/user-profiles';
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  ne,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { GetUsersDto } from './dto/get-users.dto';
import { OffsetPaginatedDto } from '../../common/offset-pagination/paginated.dto';
import { OffsetPaginationDto } from '../../common/offset-pagination/offset-pagination.dto';
import { UserResDto } from './dto/user.res.dto';
import { plainToInstance } from 'class-transformer';
import { OrderBy } from '../../constants/app.constant';
import { UserStatsResDto } from './dto/user-stats.res.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../../constants/role.constant';
import { UpdateCurrentUserReqDto } from './dto/update-current-user.req.dto';
import { UpdateUserReqDto } from './dto/update-user.req.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) {}

  async getUsers(
    pageOptions: GetUsersDto,
  ): Promise<OffsetPaginatedDto<UserResDto>> {
    const conditions: SQL[] = [ne(users.role, Role.ADMIN)];

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

    const [entities, [{ total }]] = await Promise.all([
      this.db.query.users.findMany({
        where,
        orderBy,
        limit: pageOptions.limit,
        offset: pageOptions.offset,
        with: {
          profile: true,
        },
      }),
      this.db
        .select({ total: count() })
        .from(users)
        .where(where),
    ]);

    return new OffsetPaginatedDto(
      plainToInstance(UserResDto, entities),
      new OffsetPaginationDto(total, pageOptions),
    );
  }

  async getUserById(userId: string): Promise<UserResDto> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        profile: true,
      },
    });

    if (!user || !user.profile) {
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
    const hasProfileUpdate =
      reqDto.phone !== undefined ||
      reqDto.location !== undefined ||
      reqDto.bio !== undefined ||
      reqDto.avatarUrl !== undefined;

    if (reqDto.fullName === undefined && !hasProfileUpdate) {
      return this.getUserById(userId);
    }

    await this.ensureUserExists(userId);

    await this.db.transaction(async (tx) => {
      if (reqDto.fullName !== undefined) {
        await tx
          .update(users)
          .set({
            fullName: reqDto.fullName,
          })
          .where(eq(users.id, userId));
      }

      if (hasProfileUpdate) {
        await tx
          .insert(userProfiles)
          .values({
            userId,
            phone: reqDto.phone,
            location: reqDto.location,
            bio: reqDto.bio,
            avatarUrl: reqDto.avatarUrl,
          })
          .onConflictDoUpdate({
            target: userProfiles.userId,
            set: {
              phone: reqDto.phone,
              location: reqDto.location,
              bio: reqDto.bio,
              avatarUrl: reqDto.avatarUrl,
              updatedAt: new Date(),
            },
          });
      }
    });

    return this.getUserById(userId);
  }

  async update(userId: string, reqDto: UpdateUserReqDto): Promise<UserResDto> {
    await this.ensureUserExists(userId);

    const hasProfileUpdate =
      reqDto.phone !== undefined ||
      reqDto.location !== undefined ||
      reqDto.bio !== undefined ||
      reqDto.avatarUrl !== undefined;

    if (reqDto.email || reqDto.username) {
      const duplicatedUser = await this.db.query.users.findFirst({
        where: and(
          ne(users.id, userId),
          or(
            reqDto.email ? eq(users.email, reqDto.email) : undefined,
            reqDto.username ? eq(users.username, reqDto.username) : undefined,
          ),
        ),
        columns: {
          id: true,
        },
      });

      if (duplicatedUser) {
        throw new AppException(
          ErrorCode.E001,
          'User with this email or username already exists',
          HttpStatus.CONFLICT,
        );
      }
    }

    const password = reqDto.password
      ? await bcrypt.hash(reqDto.password, 10)
      : undefined;

    await this.db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          email: reqDto.email,
          username: reqDto.username,
          fullName: reqDto.fullName,
          password,
          role: reqDto.role,
          isLocked: reqDto.isLocked,
        })
        .where(eq(users.id, userId));

      if (hasProfileUpdate) {
        await tx
          .insert(userProfiles)
          .values({
            userId,
            phone: reqDto.phone,
            location: reqDto.location,
            bio: reqDto.bio,
            avatarUrl: reqDto.avatarUrl,
          })
          .onConflictDoUpdate({
            target: userProfiles.userId,
            set: {
              phone: reqDto.phone,
              location: reqDto.location,
              bio: reqDto.bio,
              avatarUrl: reqDto.avatarUrl,
              updatedAt: new Date(),
            },
          });
      }

      if (reqDto.isLocked) {
        await tx.delete(sessions).where(eq(sessions.userId, userId));
      }
    });

    return this.getUserById(userId);
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

  async toggleLock(userId: string): Promise<UserResDto> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        isLocked: true,
      },
    });

    if (!user) {
      throw new AppException(
        ErrorCode.E002,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const nextIsLocked = !user.isLocked;
    await this.db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ isLocked: nextIsLocked })
        .where(eq(users.id, userId));

      if (nextIsLocked) {
        await tx.delete(sessions).where(eq(sessions.userId, userId));
      }
    });

    return this.getUserById(userId);
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
    const createdUser = await this.db.transaction(async (tx) => {
      const [user] = await tx
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
        });

      await tx.insert(userProfiles).values({ userId: user.id });

      return user;
    });

    return this.getUserById(createdUser.id);
  }

  private async ensureUserExists(userId: string): Promise<void> {
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
  }

}
