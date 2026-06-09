import {
  Controller,
  Get,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { Permission } from '../../constants/permission.constant';
import { ApiAuth } from '../../decorators/http.decorators';
import { UUIDParam } from '../../decorators/param.decorators';
import { Permissions } from '../../decorators/permissions.decorator';
import { LessonDetailResDto } from './dto/lesson-detail.res.dto';
import { LessonPartResDto } from './dto/lesson-part.res.dto';
import { UpdateLessonTheoriesReqDto } from './dto/update-lesson-theories.req.dto';
import { LessonsService } from './lessons.service';

@ApiTags('lessons')
@Controller({
  path: 'lessons',
  version: '1',
})
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get(':lessonId')
  @Permissions(Permission.COURSES_READ)
  @ApiAuth({
    type: LessonDetailResDto,
    summary: 'Lay chi tiet bai hoc',
  })
  getLessonById(
    @UUIDParam('lessonId') lessonId: string,
  ): Promise<LessonDetailResDto> {
    return this.lessonsService.getLessonById(lessonId);
  }

  @Put(':lessonId/theories')
  @Permissions(Permission.COURSES_MANAGE)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateLessonTheoriesReqDto,
  })
  @ApiAuth({
    type: LessonPartResDto,
    summary: 'Cap nhat danh sach ly thuyet cua bai hoc',
    isArray: true,
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = randomUUID();
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  updateLessonTheories(
    @UUIDParam('lessonId') lessonId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<LessonPartResDto[]> {
    return this.lessonsService.updateLessonTheories(lessonId, files);
  }
}
