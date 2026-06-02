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

describe('UsersService', () => {
  let service: UsersService;
  let db: DbMock;

  beforeEach(() => {
    db = createDbMock();
    service = new UsersService(db as unknown as Database);
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
});
