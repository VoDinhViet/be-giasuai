import { Test } from '@nestjs/testing';

import { CourseLevel, CourseStatus } from './constants/course.constant';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

describe('CoursesController', () => {
  let controller: CoursesController;
  let coursesService: jest.Mocked<Pick<CoursesService, 'create'>>;

  beforeEach(async () => {
    coursesService = {
      create: jest.fn(),
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
      authorId: null,
      authorName: null,
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
});
