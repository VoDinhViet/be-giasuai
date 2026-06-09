import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AllConfigType } from '../../config/config.type';
import { ErrorCode } from '../../constants/error-code.constant';
import type { Database } from '../../database/database.type';
import { LessonStatus, LessonType } from '../courses/constants/course.constant';
import { LessonsService } from './lessons.service';

type DbMock = {
  query: {
    lessons: {
      findFirst: jest.Mock;
    };
  };
  transaction: jest.Mock;
};

function createDbMock(): DbMock {
  return {
    query: {
      lessons: {
        findFirst: jest.fn(),
      },
    },
    transaction: jest.fn(),
  };
}

function mockGetLessonByQuery(
  db: DbMock,
  lesson: Record<string, unknown> | null,
): void {
  db.query.lessons.findFirst.mockResolvedValueOnce(lesson);
}

describe('LessonsService', () => {
  let db: DbMock;
  let service: LessonsService;

  beforeEach(() => {
    db = createDbMock();
    const configServiceMock = {
      get: jest.fn((key: string) => {
        if (key === 'app.backendDomain') return 'http://localhost';
        if (key === 'app.port') return 3000;
        return null;
      }),
    };

    service = new LessonsService(
      db as unknown as Database,
      configServiceMock as unknown as ConfigService<AllConfigType>,
    );
  });

  it('gets lesson detail by id', async () => {
    const lessonId = '3f7d99ef-4999-4d7f-92a2-b5a59d53df08';
    mockGetLessonByQuery(db, {
      id: lessonId,
      courseId: '6f7d99ef-4999-4d7f-92a2-b5a59d53df08',
      sectionId: '2f7d99ef-4999-4d7f-92a2-b5a59d53df08',
      code: 'AI-101-L01',
      title: 'Prompt basics',
      durationMinutes: 45,
      type: LessonType.EXERCISE,
      status: LessonStatus.DRAFT,
      resourceCount: 2,
      position: 1,
      createdAt: new Date('2026-06-01T00:00:00.000Z'),
      updatedAt: new Date('2026-06-01T00:00:00.000Z'),
      parts: [
        {
          id: '4f7d99ef-4999-4d7f-92a2-b5a59d53df08',
          lessonId,
          title: 'Cau hoi tot can co gi',
          type: 'TEXT',
          fileUrl: '/uploads/theory.pdf',
          originalName: 'theory.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 191000,
          position: 1,
          isPublished: true,
          createdAt: new Date('2026-06-01T00:00:00.000Z'),
          updatedAt: new Date('2026-06-01T00:00:00.000Z'),
        },
      ],
    });

    await expect(service.getLessonById(lessonId)).resolves.toMatchObject({
      id: lessonId,
      code: 'AI-101-L01',
      title: 'Prompt basics',
      parts: [
        {
          title: 'Cau hoi tot can co gi',
          type: 'TEXT',
        },
      ],
    });
  });

  it('throws not found when getting missing lesson detail', async () => {
    mockGetLessonByQuery(db, null);

    await expect(
      service.getLessonById('3f7d99ef-4999-4d7f-92a2-b5a59d53df08'),
    ).rejects.toMatchObject({
      response: {
        errorCode: ErrorCode.E002,
      },
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('gets lesson theories by lesson id', async () => {
    const lessonId = '3f7d99ef-4999-4d7f-92a2-b5a59d53df08';
    mockGetLessonByQuery(db, {
      id: lessonId,
      parts: [
        {
          id: '4f7d99ef-4999-4d7f-92a2-b5a59d53df08',
          lessonId,
          title: 'Cau hoi tot can co gi',
          type: 'TEXT',
          fileUrl: '/uploads/theory.pdf',
          originalName: 'theory.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 191000,
          position: 1,
          isPublished: true,
          createdAt: new Date('2026-06-01T00:00:00.000Z'),
          updatedAt: new Date('2026-06-01T00:00:00.000Z'),
        },
      ],
    });

    await expect(service.getLessonTheories(lessonId)).resolves.toMatchObject([
      {
        title: 'Cau hoi tot can co gi',
        type: 'TEXT',
        fileUrl: '/uploads/theory.pdf',
      },
    ]);
  });

  it('throws not found when getting theories for missing lesson', async () => {
    mockGetLessonByQuery(db, null);

    await expect(
      service.getLessonTheories('3f7d99ef-4999-4d7f-92a2-b5a59d53df08'),
    ).rejects.toMatchObject({
      response: {
        errorCode: ErrorCode.E002,
      },
      status: HttpStatus.NOT_FOUND,
    });
  });

  describe('updateLessonTheories', () => {
    it('updates lesson theories successfully', async () => {
      const lessonId = '3f7d99ef-4999-4d7f-92a2-b5a59d53df08';
      const mockFiles = [
        {
          filename: 'file1.pdf',
          originalname: 'file1.pdf',
          mimetype: 'application/pdf',
          size: 191000,
        } as unknown as Express.Multer.File,
      ];

      const deleteWhere = jest.fn().mockResolvedValue(undefined);
      const insertValues = jest.fn().mockResolvedValue(undefined);
      const tx = {
        delete: jest.fn().mockReturnValue({ where: deleteWhere }),
        insert: jest.fn().mockReturnValue({ values: insertValues }),
      };

      db.transaction.mockImplementation(
        async (callback: (value: typeof tx) => Promise<unknown>) =>
          callback(tx),
      );

      db.query.lessons.findFirst
        .mockResolvedValueOnce({ id: lessonId })
        .mockResolvedValueOnce({
          id: lessonId,
          parts: [
            {
              id: 'part-1',
              title: 'Phần 1',
              type: 'TEXT',
              fileUrl: 'http://localhost:3000/uploads/file1.pdf',
              originalName: 'file1.pdf',
              mimeType: 'application/pdf',
              sizeBytes: 191000,
              position: 1,
              isPublished: true,
              createdAt: new Date('2026-06-01T00:00:00.000Z'),
              updatedAt: new Date('2026-06-01T00:00:00.000Z'),
            },
          ],
        });

      const result = await service.updateLessonTheories(lessonId, mockFiles);

      expect(tx.delete).toHaveBeenCalled();
      expect(deleteWhere).toHaveBeenCalled();
      expect(tx.insert).toHaveBeenCalled();
      expect(insertValues).toHaveBeenCalledWith([
        {
          lessonId,
          title: 'Phần 1',
          type: 'TEXT',
          fileUrl: 'http://localhost:3000/uploads/file1.pdf',
          originalName: 'file1.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 191000,
          position: 1,
          isPublished: true,
        },
      ]);
      expect(result).toMatchObject([
        {
          title: 'Phần 1',
          type: 'TEXT',
          fileUrl: 'http://localhost:3000/uploads/file1.pdf',
        },
      ]);
    });

    it('throws not found when updating theories for missing lesson', async () => {
      mockGetLessonByQuery(db, null);

      await expect(
        service.updateLessonTheories(
          '3f7d99ef-4999-4d7f-92a2-b5a59d53df08',
          [],
        ),
      ).rejects.toMatchObject({
        response: {
          errorCode: ErrorCode.E002,
        },
        status: HttpStatus.NOT_FOUND,
      });
    });
  });
});
