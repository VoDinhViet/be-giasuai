import { CoursesService } from './courses.service';
import type { Database } from '../../database/database.type';
import {
  courseLessonParts,
  courseLessons,
  courseSections,
  courses,
} from '../../database/schemas';

type DbMock = {
  query: {
    courses: {
      findFirst: jest.Mock;
    };
  };
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  transaction: jest.Mock;
  select: jest.Mock;
};

function createDbMock(): DbMock {
  return {
    query: {
      courses: {
        findFirst: jest.fn(),
      },
    },
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    transaction: jest.fn(),
    select: jest.fn(),
  };
}

function createInsertReturningMock(row: unknown) {
  const values = jest.fn().mockReturnValue({
    returning: jest.fn().mockResolvedValue([row]),
  });

  return {
    insert: jest.fn().mockReturnValue({ values }),
    values,
  };
}

function createTransactionMock() {
  const insertedValues: Array<{
    table: unknown;
    values: Record<string, unknown>;
  }> = [];

  const tx = {
    delete: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    }),
    insert: jest.fn((table: unknown) => ({
      values: jest.fn((values: Record<string, unknown>) => {
        insertedValues.push({ table, values });

        return {
          returning: jest.fn().mockResolvedValue([
            {
              id:
                table === courseSections
                  ? 'section-id'
                  : table === courseLessons
                    ? 'lesson-id'
                    : 'lesson-part-id',
            },
          ]),
        };
      }),
    })),
  };

  return { tx, insertedValues };
}

describe('CoursesService', () => {
  let db: DbMock;
  let service: CoursesService;

  beforeEach(() => {
    db = createDbMock();
    service = new CoursesService(db as unknown as Database);
  });

  it('createCourse generates a unique slug and stores parsed metadata', async () => {
    db.query.courses.findFirst.mockResolvedValue(null);
    const insertMock = createInsertReturningMock({
      id: 'course-id',
      title: 'Toán học lớp 10',
      slug: 'toan-hoc-lop-10',
      description: 'Course description',
      thumbnailUrl: 'uploads/thumb.png',
      tags: ['math'],
      learningOutcomes: ['Understand algebra'],
      isPublished: false,
      createdAt: new Date('2026-06-02T00:00:00.000Z'),
      updatedAt: new Date('2026-06-02T00:00:00.000Z'),
    });
    db.insert = insertMock.insert;

    const result = await service.createCourse(
      {
        title: 'Toán học lớp 10',
        description: 'Course description',
        tags: JSON.stringify(['math']),
        learningOutcomes: JSON.stringify(['Understand algebra']),
      },
      {
        filename: 'thumb.png',
      } as Express.Multer.File,
    );

    expect(result).toMatchObject({
      id: 'course-id',
      slug: 'toan-hoc-lop-10',
      thumbnailUrl: 'http://localhost:8003/uploads/thumb.png',
    });
    expect(insertMock.values).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Toán học lớp 10',
        slug: 'toan-hoc-lop-10',
        thumbnailUrl: 'uploads/thumb.png',
        tags: ['math'],
        learningOutcomes: ['Understand algebra'],
        isPublished: false,
      }),
    );
  });

  it('syncCourseCurriculum replaces sections, lessons, and lesson parts', async () => {
    const { tx, insertedValues } = createTransactionMock();
    db.query.courses.findFirst
      .mockResolvedValueOnce({ id: 'course-id' })
      .mockResolvedValueOnce({
        id: 'course-id',
        courseSections: [],
      });
    db.transaction.mockImplementation(async (callback) => callback(tx));

    const result = await service.syncCourseCurriculum(
      'course-id',
      {
        courseSections: JSON.stringify([
          {
            title: 'Section 1',
            lessons: [
              {
                title: 'Lesson 1',
                lessonParts: [
                  {
                    title: 'Slide bài học',
                  },
                ],
              },
            ],
          },
        ]),
      },
      [
        {
          fieldname: 'file_s0_l0_ss0',
          filename: 'slide.pdf',
        } as Express.Multer.File,
      ],
    );

    expect(result).toEqual({ courseSections: [] });
    expect(tx.delete).toHaveBeenCalledWith(courseSections);
    expect(insertedValues).toEqual([
      {
        table: courseSections,
        values: expect.objectContaining({
          courseId: 'course-id',
          title: 'Section 1',
          position: 1,
        }),
      },
      {
        table: courseLessons,
        values: expect.objectContaining({
          sectionId: 'section-id',
          title: 'Lesson 1',
          position: 1,
          isPublished: true,
        }),
      },
      {
        table: courseLessonParts,
        values: expect.objectContaining({
          lessonId: 'lesson-id',
          title: 'Slide bài học',
          partType: 'PDF',
          fileUrl: 'uploads/slide.pdf',
          position: 1,
          isPublished: true,
        }),
      },
    ]);
  });
});
