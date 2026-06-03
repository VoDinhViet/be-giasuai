import { HttpStatus } from '@nestjs/common';

import { UsersService } from './users.service';
import { Role } from '../../constants/role.constant';
import { ErrorCode } from '../../constants/error-code.constant';
import type { Database } from '../../database/database.type';

type DbMock = {
  query: {
    users: {
      findFirst: jest.Mock;
    };
  };
  update: jest.Mock;
  delete: jest.Mock;
  transaction: jest.Mock;
};

function createDbMock(): DbMock {
  return {
    query: {
      users: {
        findFirst: jest.fn(),
      },
    },
    update: jest.fn(),
    delete: jest.fn(),
    transaction: jest.fn(),
  };
}

function createUpdateReturningMock(row: unknown): jest.Mock {
  return jest.fn().mockReturnValue({
    set: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([row]),
      }),
    }),
  });
}

function createSelectFindOneMock(row: unknown): Pick<
  DbMock,
  'update' | 'delete' | 'transaction'
> & {
  select: jest.Mock;
} {
  return {
    query: {
      users: {
        findFirst: jest.fn(),
      },
    },
    update: jest.fn(),
    delete: jest.fn(),
    transaction: jest.fn(),
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(row ? [row] : []),
        }),
      }),
    }),
  } as unknown as Pick<DbMock, 'update' | 'delete' | 'transaction'> & {
    select: jest.Mock;
  };
}

describe('UsersService', () => {
  let service: UsersService;
  let db: DbMock;

  beforeEach(() => {
    db = createDbMock();
    service = new UsersService(db as unknown as Database);
  });

  it('getUsers excludes admin accounts by default', async () => {
    const listWhere = jest.fn().mockReturnValue({
      orderBy: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          offset: jest.fn().mockResolvedValue([]),
        }),
      }),
    });
    const countWhere = jest.fn().mockResolvedValue([{ total: 0 }]);

    db = {
      ...db,
      select: jest
        .fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: listWhere,
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: countWhere,
          }),
        }),
    } as unknown as DbMock;
    service = new UsersService(db as unknown as Database);

    await service.getUsers({ page: 1, limit: 10 });

    expect(listWhere).toHaveBeenCalledWith(expect.anything());
    expect(countWhere).toHaveBeenCalledWith(expect.anything());
  });

  it('toggleLock deletes active sessions when locking a user', async () => {
    const txUpdateWhere = jest.fn().mockResolvedValue(undefined);
    const txDeleteWhere = jest.fn().mockResolvedValue(undefined);
    const tx = {
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: txUpdateWhere,
        }),
      }),
      delete: jest.fn().mockReturnValue({
        where: txDeleteWhere,
      }),
    };

    db.query.users.findFirst.mockResolvedValue({ id: 'user-id' });
    db.transaction.mockImplementation(async (callback: (value: typeof tx) => Promise<void>) =>
      callback(tx),
    );

    await service.toggleLock('user-id', { isLocked: true });

    expect(tx.update).toHaveBeenCalled();
    expect(tx.delete).toHaveBeenCalled();
    expect(txUpdateWhere).toHaveBeenCalled();
    expect(txDeleteWhere).toHaveBeenCalled();
  });

  it('toggleLock throws when user does not exist', async () => {
    db.query.users.findFirst.mockResolvedValue(null);

    await expect(
      service.toggleLock('missing-user-id', { isLocked: true }),
    ).rejects.toMatchObject({
      response: {
        errorCode: ErrorCode.E002,
      },
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('verifyTeacher unlocks a teacher account', async () => {
    db.query.users.findFirst.mockResolvedValue({ id: 'teacher-id' });
    db.update = createUpdateReturningMock({
      id: 'teacher-id',
      email: 'teacher@example.com',
      username: 'teacher',
      fullName: 'Teacher',
      role: Role.TEACHER,
      isLocked: false,
      createdAt: new Date('2026-06-02T00:00:00.000Z'),
    });

    const result = await service.verifyTeacher('teacher-id');

    expect(result).toMatchObject({
      id: 'teacher-id',
      role: Role.TEACHER,
      isLocked: false,
    });
    const updateBuilder = db.update.mock.results[0].value;
    expect(updateBuilder.set).toHaveBeenCalledWith({ isLocked: false });
  });

  it('verifyTeacher throws when target is not a teacher', async () => {
    db.query.users.findFirst.mockResolvedValue(null);

    await expect(service.verifyTeacher('student-id')).rejects.toMatchObject({
      response: {
        errorCode: ErrorCode.E009,
      },
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('updateCurrentUser updates only the current user profile fields', async () => {
    db.query.users.findFirst.mockResolvedValue({ id: 'user-id' });
    db.update = createUpdateReturningMock({
      id: 'user-id',
      email: 'student@example.com',
      username: 'student',
      fullName: 'Updated Name',
      role: Role.STUDENT,
      isLocked: false,
      createdAt: new Date('2026-06-02T00:00:00.000Z'),
    });

    const result = await service.updateCurrentUser('user-id', {
      fullName: 'Updated Name',
    });

    expect(result).toMatchObject({
      id: 'user-id',
      fullName: 'Updated Name',
      role: Role.STUDENT,
    });
    const updateBuilder = db.update.mock.results[0].value;
    expect(updateBuilder.set).toHaveBeenCalledWith({
      fullName: 'Updated Name',
    });
  });

  it('updateCurrentUser returns current profile when request has no updatable fields', async () => {
    const dbWithSelect = createSelectFindOneMock({
      id: 'user-id',
      email: 'student@example.com',
      username: 'student',
      fullName: 'Current Name',
      role: Role.STUDENT,
      isLocked: false,
      createdAt: new Date('2026-06-02T00:00:00.000Z'),
    });
    service = new UsersService(dbWithSelect as unknown as Database);

    const result = await service.updateCurrentUser('user-id', {});

    expect(result).toMatchObject({
      id: 'user-id',
      fullName: 'Current Name',
    });
    expect(dbWithSelect.update).not.toHaveBeenCalled();
  });
});
