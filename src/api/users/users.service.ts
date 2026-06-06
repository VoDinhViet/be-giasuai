import { HttpStatus, Inject, Injectable } from '@nestjs/common';
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
import { UserRole } from '../../constants/role.constant';
import { UpdateUserReqDto } from './dto/update-user.req.dto';
import { hashPassword } from '../../utils/password.util';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) {}

  /**
   * Gets non-admin users by filter and pagination options.
   * @param pageOptions Search keyword, role, lock status, sort, limit, and offset.
   * @returns Paginated users and pagination metadata.
   */
  async getUsers(
    pageOptions: GetUsersDto,
  ): Promise<OffsetPaginatedDto<UserResDto>> {
    const conditions: SQL[] = [ne(users.role, UserRole.ADMIN)];

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
      this.db.select({ total: count() }).from(users).where(where),
    ]);

    return new OffsetPaginatedDto(
      plainToInstance(UserResDto, entities),
      new OffsetPaginationDto(total, pageOptions),
    );
  }

  /**
   * Gets one user with the required profile relation.
   * @param userId User id to find.
   * @returns User detail DTO.
   * @throws AppException when the user or profile does not exist.
   */
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
        HttpStatus.NOT_FOUND,
        'User not found',
      );
    }

    return plainToInstance(UserResDto, user);
  }

  /**
   * Updates one user's account and profile fields.
   * @param userId User id to update.
   * @param reqDto Account/profile fields from the request body.
   * @returns Updated user detail DTO.
   * @throws AppException when the user does not exist or email/username is duplicated.
   */
  async update(userId: string, reqDto: UpdateUserReqDto): Promise<UserResDto> {
    await this.ensureUserExists(userId);

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
          HttpStatus.CONFLICT,
          'User with this email or username already exists',
        );
      }
    }

    await this.db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          ...reqDto,
          ...(reqDto.password
            ? { password: await hashPassword(reqDto.password) }
            : {}),
        })
        .where(eq(users.id, userId));

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

      if (reqDto.isLocked) {
        await tx.delete(sessions).where(eq(sessions.userId, userId));
      }
    });

    return this.getUserById(userId);
  }

  /**
   * Gets aggregate user statistics for dashboard usage.
   * @returns Total, new today, active in last 24 hours, and locked user counts.
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
   * Toggles one user's locked status and clears sessions when locking.
   * @param userId User id to toggle.
   * @returns Updated user detail DTO.
   * @throws AppException when the user does not exist.
   */
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
        HttpStatus.NOT_FOUND,
        'User not found',
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

  /**
   * Creates one user account and its required profile row.
   * @param dto Email, username, password, full name, and role for the new user.
   * @returns Created user detail DTO.
   * @throws AppException when email or username already exists.
   */
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
        HttpStatus.CONFLICT,
        'User with this email or username already exists',
      );
    }

    const hashedPassword = await hashPassword(dto.password);
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

  /**
   * Checks that a user exists before mutating data.
   * @param userId User id to check.
   * @returns Void when the user exists.
   * @throws AppException when the user does not exist.
   */
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
        HttpStatus.NOT_FOUND,
        'User not found',
      );
    }
  }
}
