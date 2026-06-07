import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Cache } from 'cache-manager';
import * as bcrypt from 'bcryptjs';

import { AuthService } from './auth.service';
import { UserRole } from '../../constants/role.constant';
import { ErrorCode } from '../../constants/error-code.constant';
import { AppException } from '../../exceptions/app.exception';
import type { AllConfigType } from '../../config/config.type';
import type { Database } from '../../database/database.type';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

type DbMock = {
  query: {
    users: {
      findFirst: jest.Mock;
    };
    sessions: {
      findFirst: jest.Mock;
    };
  };
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  transaction: jest.Mock;
};

type CacheMock = jest.Mocked<Pick<Cache, 'get' | 'set' | 'del'>>;
type JwtMock = jest.Mocked<Pick<JwtService, 'signAsync' | 'verify'>>;
type BcryptHash = (value: string, salt: number) => Promise<string>;
type BcryptCompare = (value: string, hash: string) => Promise<boolean>;

const configValues: Record<string, string> = {
  'auth.expires': '15m',
  'auth.refreshExpires': '7d',
  'auth.secret': 'access-secret',
  'auth.refreshSecret': 'refresh-secret',
  'auth.confirmEmailExpires': '10m',
  'auth.passwordResetExpires': '10m',
  'auth.otpResendCooldown': '1m',
};

function createConfigService(): ConfigService<AllConfigType> {
  return {
    getOrThrow: jest.fn((key: string) => configValues[key]),
  } as unknown as ConfigService<AllConfigType>;
}

function createCacheMock(): CacheMock {
  return {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };
}

function createJwtMock(): JwtMock {
  return {
    signAsync: jest
      .fn()
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token'),
    verify: jest.fn(),
  };
}

function createDbMock(): DbMock {
  return {
    query: {
      users: {
        findFirst: jest.fn(),
      },
      sessions: {
        findFirst: jest.fn(),
      },
    },
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    transaction: jest.fn(),
  };
}

function createInsertReturningMock(row: unknown): jest.Mock {
  return jest.fn().mockReturnValue({
    values: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue([row]),
    }),
  });
}

function createUpdateWhereMock(): jest.Mock {
  return jest.fn().mockReturnValue({
    set: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    }),
  });
}

describe('AuthService', () => {
  let service: AuthService;
  let db: DbMock;
  let cache: CacheMock;
  let jwt: JwtMock;
  let bcryptHash: jest.MockedFunction<BcryptHash>;
  let bcryptCompare: jest.MockedFunction<BcryptCompare>;

  beforeEach(() => {
    db = createDbMock();
    cache = createCacheMock();
    jwt = createJwtMock();
    bcryptHash = bcrypt.hash as unknown as jest.MockedFunction<BcryptHash>;
    bcryptCompare =
      bcrypt.compare as unknown as jest.MockedFunction<BcryptCompare>;
    service = new AuthService(
      createConfigService(),
      cache as unknown as Cache,
      db as unknown as Database,
      jwt as unknown as JwtService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('register creates a locked non-admin user and stores registration OTP', async () => {
    db.query.users.findFirst.mockResolvedValue(null);
    db.insert = createInsertReturningMock({ id: 'user-id' });
    cache.get.mockResolvedValue(false);
    bcryptHash.mockResolvedValue('hashed-value');

    const result = await service.register({
      email: 'student@example.com',
      username: 'student',
      fullName: 'Student',
      password: 'secret123',
      role: UserRole.LEARNER,
    });

    expect(result.userId).toBe('user-id');
    expect(db.insert).toHaveBeenCalled();
    const insertBuilder = db.insert.mock.results[0].value;
    const valuesCall = insertBuilder.values.mock.calls[0][0];
    expect(valuesCall).toMatchObject({
      email: 'student@example.com',
      username: 'student',
      role: UserRole.LEARNER,
      isLocked: true,
    });
    expect(cache.set).toHaveBeenCalledWith(
      'registration_otp:user-id',
      { codeHash: 'hashed-value' },
      600000,
    );
  });

  it('register rejects public admin registration', async () => {
    await expect(
      service.register({
        email: 'admin@example.com',
        username: 'admin',
        fullName: 'Admin',
        password: 'secret123',
        role: UserRole.ADMIN,
      }),
    ).rejects.toMatchObject({
      response: {
        errorCode: ErrorCode.E007,
      },
      status: HttpStatus.FORBIDDEN,
    });
  });

  it('login rejects a locked user after valid password check', async () => {
    db.query.users.findFirst.mockResolvedValue({
      id: 'user-id',
      password: 'hash',
      role: UserRole.LEARNER,
      isLocked: true,
    });
    bcryptCompare.mockResolvedValue(true);

    await expect(
      service.login({
        emailOrUsername: 'student@example.com',
        password: 'secret123',
      }),
    ).rejects.toMatchObject({
      response: {
        errorCode: ErrorCode.E005,
      },
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('verifyRegistrationOtp unlocks students and deletes the used OTP', async () => {
    db.query.users.findFirst.mockResolvedValue({
      id: 'student-id',
      role: UserRole.LEARNER,
    });
    cache.get.mockResolvedValue({ codeHash: 'otp-hash' });
    db.update = createUpdateWhereMock();
    bcryptCompare.mockResolvedValue(true);

    const result = await service.verifyRegistrationOtp({
      userId: 'student-id',
      otpCode: '123456',
    });

    expect(result).toMatchObject({
      isVerified: true,
      requiresAdminVerification: false,
    });
    const updateBuilder = db.update.mock.results[0].value;
    expect(updateBuilder.set).toHaveBeenCalledWith({ isLocked: false });
    expect(cache.del).toHaveBeenCalledWith('registration_otp:student-id');
  });

  it('requestPasswordResetOtp applies cooldown even when email is unknown', async () => {
    cache.get.mockResolvedValue(false);
    db.query.users.findFirst.mockResolvedValue(null);

    const result = await service.requestPasswordResetOtp({
      email: 'missing@example.com',
    });

    expect(result.expiresInSeconds).toBe(600);
    expect(cache.set).toHaveBeenCalledTimes(1);
    expect(cache.set).toHaveBeenCalledWith(
      'password_reset_otp_cooldown:missing@example.com',
      true,
      60000,
    );
  });

  it('refreshToken rejects a refresh token with mismatched session hash', async () => {
    jwt.verify.mockReturnValue({
      sessionId: 'session-id',
      hash: 'token-hash',
      iat: 1,
      exp: 2,
    });
    db.query.sessions.findFirst.mockResolvedValue({
      id: 'session-id',
      userId: 'user-id',
      hash: 'stored-hash',
      user: {
        id: 'user-id',
        role: UserRole.LEARNER,
        isLocked: false,
      },
    });

    await expect(
      service.refreshToken({ refreshToken: 'refresh-token' }),
    ).rejects.toMatchObject({
      response: {
        errorCode: ErrorCode.E008,
      },
      status: HttpStatus.UNAUTHORIZED,
    });
  });
});
