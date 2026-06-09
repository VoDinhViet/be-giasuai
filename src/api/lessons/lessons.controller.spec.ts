import { Test } from '@nestjs/testing';

import { LessonStatus, LessonType } from '../courses/constants/course.constant';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

describe('LessonsController', () => {
  let controller: LessonsController;
  let lessonsService: jest.Mocked<
    Pick<LessonsService, 'getLessonById' | 'updateLessonTheories'>
  >;

  beforeEach(async () => {
    lessonsService = {
      getLessonById: jest.fn(),
      updateLessonTheories: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [LessonsController],
      providers: [
        {
          provide: LessonsService,
          useValue: lessonsService,
        },
      ],
    }).compile();

    controller = moduleRef.get(LessonsController);
  });

  it('delegates get lesson detail request to service', async () => {
    const lessonId = '3f7d99ef-4999-4d7f-92a2-b5a59d53df08';
    const lesson = {
      id: lessonId,
      code: 'AI-101-L01',
      title: 'Prompt basics',
      durationMinutes: 45,
      type: LessonType.EXERCISE,
      status: LessonStatus.DRAFT,
      resourceCount: 2,
      position: 1,
      parts: [],
    };

    lessonsService.getLessonById.mockResolvedValue(lesson);

    await expect(controller.getLessonById(lessonId)).resolves.toEqual(lesson);
    expect(lessonsService.getLessonById).toHaveBeenCalledWith(lessonId);
  });

  it('delegates update lesson theories request to service', async () => {
    const lessonId = '3f7d99ef-4999-4d7f-92a2-b5a59d53df08';
    const mockFiles = [
      {
        filename: 'theory-1.pdf',
        originalname: 'theory-1.pdf',
        mimetype: 'application/pdf',
        size: 191000,
      } as unknown as Express.Multer.File,
    ];
    const theories = [
      {
        id: '4f7d99ef-4999-4d7f-92a2-b5a59d53df08',
        title: 'Phần 1',
        type: 'TEXT',
        fileUrl: 'http://localhost:3000/uploads/theory-1.pdf',
        originalName: 'theory-1.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 191000,
        position: 1,
        isPublished: true,
      },
    ];

    lessonsService.updateLessonTheories.mockResolvedValue(theories);

    await expect(
      controller.updateLessonTheories(lessonId, mockFiles),
    ).resolves.toEqual(theories);
    expect(lessonsService.updateLessonTheories).toHaveBeenCalledWith(
      lessonId,
      mockFiles,
    );
  });
});
