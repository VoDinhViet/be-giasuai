import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../../constants/error-code.constant';
import type { Database } from '../../database/database.type';
import {
  LessonStatus,
  LessonType,
  CourseLevel,
  CourseStatus,
} from './constants/course.constant';
import { CoursesService } from './courses.service';

type DbMock = {
  query: {
    courses: {
      findFirst: jest.Mock;
    };
    lessons: {
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
      lessons: {
        findFirst: jest.fn(),
      },
    },
    insert: jest.fn(),
    select: jest.fn(),
    transaction: jest.fn(),
  };
}

function mockGetCourseByQuery(
  db: DbMock,
  course: Record<string, unknown> | null,
): void {
  db.query.courses.findFirst.mockResolvedValueOnce(course);
}

function mockGetLessonByQuery(
  db: DbMock,
  lesson: Record<string, unknown> | null,
): void {
  db.query.lessons.findFirst.mockResolvedValueOnce(lesson);
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
      author: null,
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
    const sectionValues = jest.fn().mockReturnValue({
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
        .mockReturnValueOnce({ values: sectionValues })
        .mockReturnValueOnce({ values: lessonValues }),
    };

    db.query.courses.findFirst.mockResolvedValueOnce(null);
    db.transaction.mockImplementation(
      async (callback: (value: typeof tx) => Promise<unknown>) => callback(tx),
    );
    mockGetCourseByQuery(db, createdCourse);

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
      sections: [
        {
          sectionCode: 'AI-101-C01',
          sectionTitle: 'Getting started',
          order: 1,
        },
      ],
      lessons: [
        {
          sectionCode: 'AI-101-C01',
          lessonCode: 'AI-101-L01',
          lessonTitle: 'Prompt basics',
          lessonType: LessonType.EXERCISE,
          durationMinutes: 45,
          status: LessonStatus.DRAFT,
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
    expect(sectionValues).toHaveBeenCalledWith([
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
        sectionId: '3f7d99ef-4999-4d7f-92a2-b5a59d53df08',
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

  it('gets course detail by id', async () => {
    const course = {
      id: '6f7d99ef-4999-4d7f-92a2-b5a59d53df08',
      code: 'AI-101',
      name: 'AI module',
      category: 'AI',
      author: {
        id: '9f7d99ef-4999-4d7f-92a2-b5a59d53df08',
        email: 'teacher@example.com',
        username: 'teacher001',
        fullName: 'Teacher One',
        role: 'TEACHER',
        isLocked: false,
        createdAt: new Date('2026-06-01T00:00:00.000Z'),
        profile: null,
      },
      description: 'Intro course',
      audience: 'Students',
      level: CourseLevel.BEGINNER,
      durationMinutes: 120,
      startDate: '2026-06-10',
      status: CourseStatus.DRAFT,
    };

    mockGetCourseByQuery(db, course);

    await expect(service.getCourseById(course.id)).resolves.toMatchObject({
      id: course.id,
      code: 'AI-101',
      name: 'AI module',
      author: {
        fullName: 'Teacher One',
      },
    });
  });

  it('throws not found when course id does not exist', async () => {
    mockGetCourseByQuery(db, null);

    await expect(
      service.getCourseById('6f7d99ef-4999-4d7f-92a2-b5a59d53df08'),
    ).rejects.toMatchObject({
      response: {
        errorCode: ErrorCode.E002,
      },
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('gets course curriculum by id', async () => {
    const courseId = '6f7d99ef-4999-4d7f-92a2-b5a59d53df08';
    mockGetCourseByQuery(db, {
      id: courseId,
      code: 'AI-101',
      name: 'AI module',
      category: 'AI',
      author: null,
      description: 'Intro course',
      audience: 'Students',
      level: CourseLevel.BEGINNER,
      durationMinutes: 120,
      startDate: '2026-06-10',
      status: CourseStatus.DRAFT,
      objectives: [
        {
          id: '1f7d99ef-4999-4d7f-92a2-b5a59d53df08',
          courseId,
          content: 'Understand prompt basics',
          position: 1,
          createdAt: new Date('2026-06-01T00:00:00.000Z'),
          updatedAt: new Date('2026-06-01T00:00:00.000Z'),
        },
      ],
      sections: [
        {
          id: '2f7d99ef-4999-4d7f-92a2-b5a59d53df08',
          courseId,
          code: 'AI-101-C01',
          title: 'Getting started',
          position: 1,
          createdAt: new Date('2026-06-01T00:00:00.000Z'),
          updatedAt: new Date('2026-06-01T00:00:00.000Z'),
          lessons: [
            {
              id: '3f7d99ef-4999-4d7f-92a2-b5a59d53df08',
              courseId,
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
            },
          ],
        },
      ],
    });

    await expect(service.getCourseCurriculum(courseId)).resolves.toMatchObject({
      id: courseId,
      code: 'AI-101',
      name: 'AI module',
      author: null,
      objectives: [
        {
          content: 'Understand prompt basics',
          position: 1,
        },
      ],
      sections: [
        {
          code: 'AI-101-C01',
          lessons: [
            {
              code: 'AI-101-L01',
              title: 'Prompt basics',
            },
          ],
        },
      ],
    });
  });

  it('throws not found when getting curriculum for missing course', async () => {
    mockGetCourseByQuery(db, null);

    await expect(
      service.getCourseCurriculum('6f7d99ef-4999-4d7f-92a2-b5a59d53df08'),
    ).rejects.toMatchObject({
      response: {
        errorCode: ErrorCode.E002,
      },
      status: HttpStatus.NOT_FOUND,
    });
  });
});
