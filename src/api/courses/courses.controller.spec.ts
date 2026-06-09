import { Test } from '@nestjs/testing';

import { CourseLevel, CourseStatus } from './constants/course.constant';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { GetCoursesDto } from './dto/get-courses.dto';

describe('CoursesController', () => {
  let controller: CoursesController;
  let coursesService: jest.Mocked<
    Pick<
      CoursesService,
      'create' | 'getCourses' | 'getCourseById' | 'getCourseCurriculum'
    >
  >;

  beforeEach(async () => {
    coursesService = {
      create: jest.fn(),
      getCourses: jest.fn(),
      getCourseById: jest.fn(),
      getCourseCurriculum: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
          useValue: coursesService,
        },
      ],
    }).compile();

    controller = moduleRef.get(CoursesController);
  });

  it('delegates create course request to service', async () => {
    const reqDto = {
      code: 'AI-101',
      name: 'AI module',
      category: 'AI',
      level: CourseLevel.BEGINNER,
      durationMinutes: 120,
      status: CourseStatus.DRAFT,
    };
    const createdCourse = {
      id: '6f7d99ef-4999-4d7f-92a2-b5a59d53df08',
      ...reqDto,
      author: null,
      description: null,
      audience: null,
      startDate: null,
    };

    coursesService.create.mockResolvedValue(createdCourse);

    await expect(controller.createCourse(reqDto)).resolves.toEqual(
      createdCourse,
    );
    expect(coursesService.create).toHaveBeenCalledWith(reqDto);
  });

  it('delegates get course by id request to service', async () => {
    const courseId = '6f7d99ef-4999-4d7f-92a2-b5a59d53df08';
    const course = {
      id: courseId,
      code: 'AI-101',
      name: 'AI module',
      category: 'AI',
      author: null,
      description: null,
      audience: null,
      level: CourseLevel.BEGINNER,
      durationMinutes: 120,
      startDate: null,
      status: CourseStatus.DRAFT,
    };

    coursesService.getCourseById.mockResolvedValue(course);

    await expect(controller.getCourseById(courseId)).resolves.toEqual(course);
    expect(coursesService.getCourseById).toHaveBeenCalledWith(courseId);
  });

  it('delegates get courses request to service', async () => {
    const pageOptions = {
      limit: 10,
      page: 1,
      offset: 0,
    } as GetCoursesDto;
    const courses = {
      data: [],
      pagination: {
        currentPage: 1,
        limit: 10,
        nextPage: null,
        previousPage: null,
        totalRecords: 0,
        totalPages: 0,
      },
    } as never;

    coursesService.getCourses.mockResolvedValue(courses);

    await expect(controller.getCourses(pageOptions)).resolves.toEqual(courses);
    expect(coursesService.getCourses).toHaveBeenCalledWith(pageOptions);
  });

  it('delegates get course curriculum request to service', async () => {
    const courseId = '6f7d99ef-4999-4d7f-92a2-b5a59d53df08';
    const curriculum = {
      id: courseId,
      code: 'AI-101',
      name: 'AI module',
      category: 'AI',
      author: null,
      description: null,
      audience: null,
      level: CourseLevel.BEGINNER,
      durationMinutes: 120,
      startDate: null,
      status: CourseStatus.DRAFT,
      objectives: [],
      sections: [],
    };

    coursesService.getCourseCurriculum.mockResolvedValue(curriculum);

    await expect(controller.getCourseCurriculum(courseId)).resolves.toEqual(
      curriculum,
    );
    expect(coursesService.getCourseCurriculum).toHaveBeenCalledWith(courseId);
  });
});
