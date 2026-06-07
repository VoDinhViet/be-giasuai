import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../../constants/error-code.constant';
import type { Database } from '../../database/database.type';
import {
  CourseLessonStatus,
  CourseLessonType,
  CourseLevel,
  CourseStatus,
} from './constants/course.constant';
import { CoursesService } from './courses.service';

type DbMock = {
  query: {
    courses: {
      findFirst: jest.Mock;
    };
  };
  insert: jest.Mock;
  select: jest.Mock;
  transaction: jest.Mock;
};

function createDbMock(): DbMock {
  return {
    query: {
      courses: {
        findFirst: jest.fn(),
      },
    },
    insert: jest.fn(),
    select: jest.fn(),
    transaction: jest.fn(),
  };
}

function mockGetCourseByCodeSelect(db: DbMock, course: unknown): void {
  db.select.mockReturnValue({
    from: jest.fn().mockReturnValue({
      leftJoin: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(course ? [course] : []),
        }),
      }),
    }),
  });
}

describe('CoursesService', () => {
  let db: DbMock;
  let service: CoursesService;

  beforeEach(() => {
    db = createDbMock();
    service = new CoursesService(db as unknown as Database);
  });

  it('creates course and returns detail', async () => {
    const createdCourse = {
      id: '6f7d99ef-4999-4d7f-92a2-b5a59d53df08',
      code: 'AI-101',
      name: 'AI module',
      category: 'AI',
      authorId: null,
      authorName: null,
      description: 'Intro course',
      audience: 'Students',
      level: CourseLevel.BEGINNER,
      durationMinutes: 120,
      startDate: '2026-06-10',
      status: CourseStatus.DRAFT,
    };
    const courseValues = jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue([
        {
          id: createdCourse.id,
          code: createdCourse.code,
        },
      ]),
    });
    const chapterValues = jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue([
        {
          id: '3f7d99ef-4999-4d7f-92a2-b5a59d53df08',
          code: 'AI-101-C01',
        },
      ]),
    });
    const lessonValues = jest.fn().mockResolvedValue(undefined);
    const tx = {
      insert: jest
        .fn()
        .mockReturnValueOnce({ values: courseValues })
        .mockReturnValueOnce({ values: chapterValues })
        .mockReturnValueOnce({ values: lessonValues }),
    };

    db.query.courses.findFirst.mockResolvedValue(null);
    db.transaction.mockImplementation(
      async (callback: (value: typeof tx) => Promise<unknown>) => callback(tx),
    );
    mockGetCourseByCodeSelect(db, createdCourse);

    const result = await service.create({
      code: 'AI-101',
      name: 'AI module',
      category: 'AI',
      description: 'Intro course',
      audience: 'Students',
      level: CourseLevel.BEGINNER,
      durationMinutes: 120,
      startDate: '2026-06-10',
      status: CourseStatus.DRAFT,
      chapters: [
        {
          chapterCode: 'AI-101-C01',
          chapterTitle: 'Getting started',
          order: 1,
        },
      ],
      lessons: [
        {
          chapterCode: 'AI-101-C01',
          lessonCode: 'AI-101-L01',
          lessonTitle: 'Prompt basics',
          lessonType: CourseLessonType.EXERCISE,
          durationMinutes: 45,
          status: CourseLessonStatus.DRAFT,
          resourceCount: 2,
        },
      ],
    });

    expect(courseValues).toHaveBeenCalledWith({
      code: 'AI-101',
      name: 'AI module',
      category: 'AI',
      authorId: undefined,
      description: 'Intro course',
      audience: 'Students',
      level: CourseLevel.BEGINNER,
      durationMinutes: 120,
      startDate: '2026-06-10',
      status: CourseStatus.DRAFT,
    });
    expect(chapterValues).toHaveBeenCalledWith([
      {
        courseId: createdCourse.id,
        code: 'AI-101-C01',
        title: 'Getting started',
        position: 1,
      },
    ]);
    expect(lessonValues).toHaveBeenCalledWith([
      {
        courseId: createdCourse.id,
        chapterId: '3f7d99ef-4999-4d7f-92a2-b5a59d53df08',
        code: 'AI-101-L01',
        title: 'Prompt basics',
        durationMinutes: 45,
        type: 'EXERCISE',
        status: 'DRAFT',
        resourceCount: 2,
        position: 1,
      },
    ]);
    expect(result).toMatchObject({
      id: '6f7d99ef-4999-4d7f-92a2-b5a59d53df08',
      code: 'AI-101',
      name: 'AI module',
    });
  });

  it('throws conflict when course code already exists', async () => {
    db.query.courses.findFirst.mockResolvedValue({ id: 'existing-course-id' });

    await expect(
      service.create({
        code: 'AI-101',
        name: 'AI module',
        category: 'AI',
      }),
    ).rejects.toMatchObject({
      response: {
        errorCode: ErrorCode.E001,
      },
      status: HttpStatus.CONFLICT,
    });
    expect(db.transaction).not.toHaveBeenCalled();
  });
});
