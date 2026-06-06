import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import type { Cache } from 'cache-manager';
import { randomBytes, randomInt } from 'crypto';
import { eq, or } from 'drizzle-orm';
import ms from 'ms';
import * as bcrypt from 'bcryptjs';

import { ErrorCode } from '../../constants/error-code.constant';
import { Uuid } from '../../common/types/common.type';
import { AppException } from '../../exceptions/app.exception';
import { AllConfigType } from '../../config/config.type';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.type';
import { users } from '../../database/schemas/users';
import { sessions } from '../../database/schemas/sessions';
import { userProfiles } from '../../database/schemas/user-profiles';

import { CacheKey } from '../../constants/cache.constant';
import { createCacheKey } from '../../utils/cache.util';
import { hashPassword, verifyPassword } from '../../utils/password.util';
import { LoginReqDto } from './dto/login.req.dto';
import { LoginResDto } from './dto/login.res.dto';
import { RegisterReqDto } from './dto/register.req.dto';
import { RegisterResDto } from './dto/register.res.dto';
import { Token } from './types/token.type';
import { JwtPayloadType } from './types/jwt-payload.type';
import { RequestRegistrationOtpReqDto } from './dto/request-registration-otp.req.dto';
import { VerifyRegistrationOtpReqDto } from './dto/verify-registration-otp.req.dto';
import { VerifyRegistrationOtpResDto } from './dto/verify-registration-otp.res.dto';
import { OtpChallengeResDto } from './dto/otp-challenge.res.dto';
import { RequestPasswordResetOtpReqDto } from './dto/request-password-reset-otp.req.dto';
import { ResetPasswordReqDto } from './dto/reset-password.req.dto';
import { RefreshTokenReqDto } from './dto/refresh-token.req.dto';
import type { RefreshJwtPayloadType } from './types/refresh-jwt-payload.type';
import { Role } from '../../constants/role.constant';
import { getPermissionCodesByRole } from '../../constants/permission.constant';

type OtpCacheValue = {
  codeHash: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(DRIZZLE)
    private readonly db: Database,
    private readonly jwtService: JwtService,
  ) {}

  private static readonly OTP_CODE_LENGTH = 6;
  private static readonly PASSWORD_SALT_ROUNDS = 10;

  private async createToken(data: {
    id: Uuid;
    sessionId: string;
    hash: string;
    role: string;
  }): Promise<Token> {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });
    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          userId: data.id,
          role: data.role,
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenExpires,
    };
  }

  async login(dto: LoginReqDto): Promise<LoginResDto> {
    const user = await this.db.query.users.findFirst({
      where: or(
        eq(users.email, dto.emailOrUsername),
        eq(users.username, dto.emailOrUsername),
      ),
      columns: {
        id: true,
        password: true,
        role: true,
        isLocked: true,
      },
    });

    if (!user) {
      throw new AppException(
        ErrorCode.E004,
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await verifyPassword(dto.password, user.password);

    if (!isPasswordValid) {
      throw new AppException(
        ErrorCode.E004,
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.isLocked) {
      throw new AppException(
        ErrorCode.E005,
        'Account is locked or pending verification',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const sessionHash = randomBytes(32).toString('hex');
    const [session] = await this.db
      .insert(sessions)
      .values({
        userId: user.id,
        hash: sessionHash,
      })
      .returning({
        id: sessions.id,
      });

    const tokens = await this.createToken({
      id: user.id,
      sessionId: session.id,
      hash: sessionHash,
      role: user.role,
    });

    return plainToInstance(LoginResDto, {
      userId: user.id,
      role: user.role,
      permissionCodes: getPermissionCodesByRole(user.role),
      ...tokens,
    });
  }

  async register(dto: RegisterReqDto): Promise<RegisterResDto> {
    if (dto.role === Role.ADMIN) {
      throw new AppException(
        ErrorCode.E007,
        'Public admin registration is not allowed',
        HttpStatus.FORBIDDEN,
      );
    }

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
          isLocked: true,
        })
        .returning({
          id: users.id,
        });

      await tx.insert(userProfiles).values({ userId: user.id });

      return user;
    });

    await this.issueRegistrationOtp(createdUser.id);

    return plainToInstance(RegisterResDto, {
      userId: createdUser.id,
    });
  }

  async requestRegistrationOtp(
    dto: RequestRegistrationOtpReqDto,
  ): Promise<OtpChallengeResDto> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, dto.userId),
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

    if (user.isLocked) {
      await this.issueRegistrationOtp(user.id);
    }

    return this.createOtpChallengeResponse('auth.confirmEmailExpires');
  }

  async verifyRegistrationOtp(
    dto: VerifyRegistrationOtpReqDto,
  ): Promise<VerifyRegistrationOtpResDto> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, dto.userId),
      columns: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      throw new AppException(
        ErrorCode.E002,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.ensureOtpMatches(
      createCacheKey(CacheKey.REGISTRATION_OTP, user.id),
      dto.otpCode,
    );

    if (user.role === Role.STUDENT) {
      await this.db
        .update(users)
        .set({ isLocked: false })
        .where(eq(users.id, user.id));
    }

    await this.cacheManager.del(
      createCacheKey(CacheKey.REGISTRATION_OTP, user.id),
    );

    return plainToInstance(VerifyRegistrationOtpResDto, {
      isVerified: true,
      requiresAdminVerification: user.role === Role.TEACHER,
    });
  }

  async requestPasswordResetOtp(
    dto: RequestPasswordResetOtpReqDto,
  ): Promise<OtpChallengeResDto> {
    const cooldownKey = createCacheKey(
      CacheKey.PASSWORD_RESET_OTP_COOLDOWN,
      dto.email,
    );

    await this.ensureOtpRequestAllowed(cooldownKey);

    const user = await this.db.query.users.findFirst({
      where: eq(users.email, dto.email),
      columns: {
        id: true,
      },
    });

    if (user) {
      await this.storeOtp(
        createCacheKey(CacheKey.PASSWORD_RESET_OTP, dto.email),
        'auth.passwordResetExpires',
      );
    }

    await this.setOtpCooldown(cooldownKey);

    return this.createOtpChallengeResponse('auth.passwordResetExpires');
  }

  async resetPassword(dto: ResetPasswordReqDto): Promise<void> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, dto.email),
      columns: {
        id: true,
      },
    });

    if (!user) {
      throw new AppException(
        ErrorCode.E006,
        'Invalid or expired OTP',
        HttpStatus.BAD_REQUEST,
      );
    }

    const cacheKey = createCacheKey(CacheKey.PASSWORD_RESET_OTP, dto.email);
    await this.ensureOtpMatches(cacheKey, dto.otpCode);

    const hashedPassword = await hashPassword(dto.newPassword);

    await this.db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, user.id));
      await tx.delete(sessions).where(eq(sessions.userId, user.id));
    });

    await this.cacheManager.del(cacheKey);
  }

  async refreshToken(dto: RefreshTokenReqDto): Promise<LoginResDto> {
    let payload: RefreshJwtPayloadType;

    try {
      payload = this.jwtService.verify<RefreshJwtPayloadType>(
        dto.refreshToken,
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
        },
      );
    } catch {
      throw new AppException(
        ErrorCode.E008,
        'Invalid refresh token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const session = await this.db.query.sessions.findFirst({
      where: eq(sessions.id, payload.sessionId),
      columns: {
        id: true,
        userId: true,
        hash: true,
      },
      with: {
        user: {
          columns: {
            id: true,
            role: true,
            isLocked: true,
          },
        },
      },
    });

    if (!session || session.hash !== payload.hash || session.user.isLocked) {
      throw new AppException(
        ErrorCode.E008,
        'Invalid refresh token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const sessionHash = randomBytes(32).toString('hex');
    await this.db
      .update(sessions)
      .set({ hash: sessionHash })
      .where(eq(sessions.id, session.id));

    const tokens = await this.createToken({
      id: session.userId,
      sessionId: session.id,
      hash: sessionHash,
      role: session.user.role,
    });

    return plainToInstance(LoginResDto, {
      userId: session.userId,
      role: session.user.role,
      permissionCodes: getPermissionCodesByRole(session.user.role),
      ...tokens,
    });
  }

  async verifyAccessToken(token: string): Promise<JwtPayloadType> {
    let payload: JwtPayloadType;
    try {
      payload = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('auth.secret', { infer: true }),
      });
    } catch {
      throw new UnauthorizedException();
    }

    // Force logout if the session is in the blacklist
    const isSessionBlacklisted = await this.cacheManager.get<boolean>(
      createCacheKey(CacheKey.SESSION_BLACKLIST, payload.sessionId),
    );

    if (isSessionBlacklisted) {
      throw new UnauthorizedException();
    }

    const session = await this.db.query.sessions.findFirst({
      where: eq(sessions.id, payload.sessionId),
      columns: {
        id: true,
        userId: true,
      },
      with: {
        user: {
          columns: {
            id: true,
            role: true,
            isLocked: true,
          },
        },
      },
    });

    if (
      !session ||
      session.userId !== payload.userId ||
      session.user.role !== payload.role ||
      session.user.isLocked
    ) {
      throw new UnauthorizedException();
    }

    return payload;
  }

  async logout(payload: JwtPayloadType): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.id, payload.sessionId));

    // Optional: Blacklist the session in cache for immediate effect
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });
    await this.cacheManager.set(
      createCacheKey(CacheKey.SESSION_BLACKLIST, payload.sessionId),
      true,
      ms(tokenExpiresIn),
    );
  }

  private async issueRegistrationOtp(userId: Uuid): Promise<void> {
    await this.issueOtp({
      cacheKey: createCacheKey(CacheKey.REGISTRATION_OTP, userId),
      cooldownKey: createCacheKey(CacheKey.REGISTRATION_OTP_COOLDOWN, userId),
      expiresConfigKey: 'auth.confirmEmailExpires',
    });
  }

  private async issueOtp(params: {
    cacheKey: string;
    cooldownKey: string;
    expiresConfigKey: 'auth.confirmEmailExpires' | 'auth.passwordResetExpires';
  }): Promise<void> {
    await this.ensureOtpRequestAllowed(params.cooldownKey);
    await Promise.all([
      this.storeOtp(params.cacheKey, params.expiresConfigKey),
      this.setOtpCooldown(params.cooldownKey),
    ]);
  }

  private async ensureOtpRequestAllowed(cooldownKey: string): Promise<void> {
    const isOnCooldown = await this.cacheManager.get<boolean>(cooldownKey);

    if (isOnCooldown) {
      throw new AppException(
        ErrorCode.V003,
        'Please wait before requesting another OTP',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async storeOtp(
    cacheKey: string,
    expiresConfigKey: 'auth.confirmEmailExpires' | 'auth.passwordResetExpires',
  ): Promise<void> {
    const otpCode = this.generateOtpCode();
    const codeHash = await bcrypt.hash(
      otpCode,
      AuthService.PASSWORD_SALT_ROUNDS,
    );

    await this.cacheManager.set(
      cacheKey,
      { codeHash } satisfies OtpCacheValue,
      this.getConfigDurationMs(expiresConfigKey),
    );
  }

  private async setOtpCooldown(cooldownKey: string): Promise<void> {
    await this.cacheManager.set(
      cooldownKey,
      true,
      this.getConfigDurationMs('auth.otpResendCooldown'),
    );
  }

  private async ensureOtpMatches(
    cacheKey: string,
    otpCode: string,
  ): Promise<void> {
    const cachedOtp = await this.cacheManager.get<unknown>(cacheKey);

    if (!this.isOtpCacheValue(cachedOtp)) {
      throw new AppException(
        ErrorCode.E006,
        'Invalid or expired OTP',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isOtpValid = await bcrypt.compare(otpCode, cachedOtp.codeHash);

    if (!isOtpValid) {
      throw new AppException(
        ErrorCode.E006,
        'Invalid or expired OTP',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private isOtpCacheValue(value: unknown): value is OtpCacheValue {
    return (
      typeof value === 'object' &&
      value !== null &&
      'codeHash' in value &&
      typeof value.codeHash === 'string'
    );
  }

  private generateOtpCode(): string {
    return randomInt(0, 10 ** AuthService.OTP_CODE_LENGTH)
      .toString()
      .padStart(AuthService.OTP_CODE_LENGTH, '0');
  }

  private createOtpChallengeResponse(
    configKey: 'auth.confirmEmailExpires' | 'auth.passwordResetExpires',
  ): OtpChallengeResDto {
    return plainToInstance(OtpChallengeResDto, {
      expiresInSeconds: Math.floor(this.getConfigDurationMs(configKey) / 1000),
    });
  }

  private getConfigDurationMs(
    configKey:
      | 'auth.confirmEmailExpires'
      | 'auth.passwordResetExpires'
      | 'auth.otpResendCooldown',
  ): number {
    const durationMs = ms(
      this.configService.getOrThrow(configKey, {
        infer: true,
      }),
    );

    if (typeof durationMs !== 'number') {
      throw new Error(`Invalid duration config: ${configKey}`);
    }

    return durationMs;
  }
}
