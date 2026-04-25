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
import { randomBytes } from 'crypto';
import { eq, or } from 'drizzle-orm';
import ms from 'ms';
import * as bcrypt from 'bcrypt';

import { ErrorCode } from '@/constants/error-code.constant';
import { Uuid } from '@/common/types/common.type';
import { AppException } from '@/exceptions/app.exception';
import { AllConfigType } from '@/config/config.type';
import { DRIZZLE } from '@/database/database.module';
import type { Database } from '@/database/database.type';
import { users } from '@/database/schemas/users';
import { sessions } from '@/database/schemas/sessions';

import { CacheKey } from '@/constants/cache.constant';
import { createCacheKey } from '@/utils/cache.util';
import { LoginReqDto } from './dto/login.req.dto';
import { LoginResDto } from './dto/login.res.dto';
import { RegisterReqDto } from './dto/register.req.dto';
import { RegisterResDto } from './dto/register.res.dto';
import { Token } from './types/token.type';
import { JwtPayloadType } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(DRIZZLE)
    private readonly db: Database,
    private readonly jwtService: JwtService,
  ) {}

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
      },
    });

    if (!user) {
      throw new AppException(
        ErrorCode.E004,
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new AppException(
        ErrorCode.E004,
        'Invalid email or password',
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
      ...tokens,
    });
  }

  async register(dto: RegisterReqDto): Promise<RegisterResDto> {
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
      });

    const token = await this.createVerificationToken({
      userId: createdUser.id,
    });
    const tokenExpiresIn = this.configService.getOrThrow(
      'auth.confirmEmailExpires',
      {
        infer: true,
      },
    );

    await this.cacheManager.set(
      createCacheKey(CacheKey.EMAIL_VERIFICATION, createdUser.id),
      token,
      ms(tokenExpiresIn),
    );

    return plainToInstance(RegisterResDto, {
      userId: createdUser.id,
    });
  }

  private async createVerificationToken(data: {
    userId: Uuid;
  }): Promise<string> {
    return Math.random().toString(36).substring(2, 15);
  }

  async verifyAccessToken(token: string): Promise<JwtPayloadType> {
    let payload: JwtPayloadType;
    try {
      payload = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('auth.secret', { infer: true }),
      });
      console.log(`🛡️ [Backend Auth] Decoded Role: ${payload.role}`);
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
}
