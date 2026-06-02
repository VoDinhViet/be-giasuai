import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

import { PageOptionsDto } from '../../common/offset-pagination/page-options.dto';
import { OffsetPaginatedDto } from '../../common/offset-pagination/paginated.dto';
import { Role } from '../../constants/role.constant';
import { ApiAuth, ApiPublic } from '../../decorators/http.decorators';
import { Roles } from '../../decorators/roles.decorator';
import { UUIDParam } from '../../decorators/param.decorators';

import { CoursesService } from './courses.service';
import { CourseCurriculumResDto } from './dto/course-curriculum.res.dto';
import { CourseDetailResDto } from './dto/course-detail.res.dto';
import { CourseLessonPartResDto } from './dto/course-lesson-detail.res.dto';
import { CourseSectionWithLessonsResDto } from './dto/course-section-with-lessons.res.dto';
import { CourseResDto } from './dto/course.res.dto';
import { CreateCourseReqDto } from './dto/create-course.req.dto';
import { PageCoursesReqDto } from './dto/page-courses.req.dto';
import { SyncCourseCurriculumReqDto } from './dto/sync-course-curriculum.req.dto';
import { UpdateCourseReqDto } from './dto/update-course.req.dto';

const uploadStorage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${extname(file.originalname)}`);
  },
});

@ApiTags('courses')
@Controller({
  path: 'courses',
  version: '1',
})
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiPublic({
    type: CourseResDto,
    summary: 'Lay danh sach khoa hoc',
    isPaginated: true,
    paginationType: 'offset',
  })
  getCourses(
    @Query() pageOptions: PageCoursesReqDto,
  ): Promise<OffsetPaginatedDto<CourseResDto>> {
    return this.coursesService.getCourses(pageOptions);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiAuth({
    type: CourseDetailResDto,
    summary: 'Tao khoa hoc',
    statusCode: HttpStatus.CREATED,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateCourseReqDto })
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: uploadStorage,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  createCourse(
    @Body() reqDto: CreateCourseReqDto,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ): Promise<CourseDetailResDto> {
    return this.coursesService.createCourse(reqDto, thumbnail);
  }

  @Get(':courseId/lessons/:lessonId')
  @ApiPublic({
    type: CourseLessonPartResDto,
    summary: 'Lay danh sach phan bai hoc cua khoa hoc',
    isPaginated: true,
    paginationType: 'offset',
  })
  getCourseLessonDetail(
    @UUIDParam('courseId') courseId: string,
    @UUIDParam('lessonId') lessonId: string,
    @Query() pageOptions: PageOptionsDto,
  ): Promise<OffsetPaginatedDto<CourseLessonPartResDto>> {
    return this.coursesService.getCourseLessonDetail(
      courseId,
      lessonId,
      pageOptions,
    );
  }

  @Get(':courseId/curriculum')
  @ApiAuth({
    type: CourseCurriculumResDto,
    summary: 'Lay de cuong khoa hoc',
  })
  getCourseCurriculum(
    @UUIDParam('courseId') courseId: string,
  ): Promise<CourseCurriculumResDto> {
    return this.coursesService.getCourseCurriculum(courseId);
  }

  @Put(':courseId/curriculum')
  @Roles(Role.ADMIN)
  @ApiAuth({
    type: CourseCurriculumResDto,
    summary: 'Dong bo de cuong khoa hoc',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SyncCourseCurriculumReqDto })
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: uploadStorage,
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  syncCourseCurriculum(
    @UUIDParam('courseId') courseId: string,
    @Body() reqDto: SyncCourseCurriculumReqDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ): Promise<CourseCurriculumResDto> {
    return this.coursesService.syncCourseCurriculum(courseId, reqDto, files);
  }

  @Get(':courseId')
  @ApiPublic({
    type: CourseDetailResDto,
    summary: 'Lay chi tiet khoa hoc',
  })
  getCourseDetail(
    @UUIDParam('courseId') courseId: string,
  ): Promise<CourseDetailResDto> {
    return this.coursesService.getCourseDetail(courseId);
  }

  @Patch(':courseId')
  @Roles(Role.ADMIN)
  @ApiAuth({
    type: CourseDetailResDto,
    summary: 'Cap nhat khoa hoc',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateCourseReqDto })
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: uploadStorage,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  updateCourse(
    @UUIDParam('courseId') courseId: string,
    @Body() reqDto: UpdateCourseReqDto,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ): Promise<CourseDetailResDto> {
    return this.coursesService.updateCourse(courseId, reqDto, thumbnail);
  }

  @Get(':courseId/sections')
  @ApiPublic({
    type: CourseSectionWithLessonsResDto,
    summary: 'Lay danh sach chuong va bai hoc cua khoa hoc',
    isArray: true,
  })
  getCourseSections(
    @UUIDParam('courseId') courseId: string,
  ): Promise<CourseSectionWithLessonsResDto[]> {
    return this.coursesService.getCourseSections(courseId);
  }

  @Delete(':courseId')
  @Roles(Role.ADMIN)
  @ApiAuth({
    summary: 'Xoa khoa hoc',
    statusCode: 204,
  })
  deleteCourse(@UUIDParam('courseId') courseId: string): Promise<void> {
    return this.coursesService.deleteCourse(courseId);
  }
}
