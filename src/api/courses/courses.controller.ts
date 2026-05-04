import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { memoryStorage } from 'multer';

import { OffsetPaginatedDto } from '../../common/offset-pagination/paginated.dto';
import { Role } from '../../constants/role.constant';
import { ApiAuth, ApiPublic } from '../../decorators/http.decorators';
import { Roles } from '../../decorators/roles.decorator';

import { CoursesService } from './courses.service';
import { CourseDetailResDto } from './dto/course-detail.res.dto';
import { CourseDetailSectionResDto } from './dto/course-detail-section.res.dto';
import { CourseResDto } from './dto/course.res.dto';
import { CreateCourseReqDto } from './dto/create-course.req.dto';
import { GetCoursesReqDto } from './dto/get-courses.req.dto';
import { UpdateCourseCurriculumReqDto } from './dto/update-course-curriculum.req.dto';
import { UpdateCourseReqDto } from './dto/update-course.req.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('courses')
@Controller({
  path: 'courses',
  version: '1',
})
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

  @Post()
  @Roles(Role.ADMIN)
  @ApiAuth({
    type: CourseResDto,
    summary: 'Tao khoa hoc',
    statusCode: 201,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        thumbnail: {
          type: 'string',
          format: 'binary',
        },
        data: {
          type: 'string',
          description: 'JSON string of CreateCourseReqDto',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: memoryStorage(),
    }),
  )
  createCourse(
    @Body() reqDto: CreateCourseReqDto,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ): Promise<CourseResDto> {
    console.log(reqDto, thumbnail);
    return this.coursesService.createCourse(reqDto, thumbnail);
  }

  @Patch(':courseId')
  @Roles(Role.ADMIN)
  @ApiAuth({
    summary: 'Cap nhat thong tin chung khoa hoc',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: memoryStorage(),
    }),
  )
  updateCourse(
    @Param('courseId') courseId: string,
    @Body() reqDto: UpdateCourseReqDto,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ): Promise<void> {
    return this.coursesService.updateCourse(courseId, reqDto, thumbnail);
  }

  @Get()
  @ApiPublic({
    type: CourseResDto,
    summary: 'Lay danh sach khoa hoc',
    isPaginated: true,
    paginationType: 'offset',
  })
  getCourses(
    @Query() pageOptions: GetCoursesReqDto,
  ): Promise<OffsetPaginatedDto<CourseResDto>> {
    return this.coursesService.getCourses(pageOptions);
  }

  @Get(':courseId')
  @ApiPublic({
    type: CourseDetailResDto,
    summary: 'Lay chi tiet khoa hoc',
  })
  getCourseDetail(
    @Param('courseId') courseId: string,
  ): Promise<CourseDetailResDto> {
    return this.coursesService.getCourseDetail(courseId);
  }

  @Get(':courseId/curriculum')
  @ApiPublic({
    type: CourseDetailSectionResDto,
    summary: 'Lay de cuong khoa hoc',
    isArray: true,
  })
  getCourseCurriculum(
    @Param('courseId') courseId: string,
  ): Promise<CourseDetailSectionResDto[]> {
    return this.coursesService.getCourseCurriculum(courseId);
  }

  
  @Delete(':courseId')
  @Roles(Role.ADMIN)
  @ApiAuth({
    summary: 'Xoa khoa hoc',
    statusCode: 204,
  })
  deleteCourse(@Param('courseId') courseId: string): Promise<void> {
    return this.coursesService.deleteCourse(courseId);
  }

  @Put(':courseId/curriculum')
  @Roles(Role.ADMIN)
  @ApiAuth({
    summary: 'Cap nhat de cuong khoa hoc',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Data chứa courseSections (chuỗi JSON) và các file đính kèm với key động (vd: file_s0_l0_ss0)',
    type: UpdateCourseCurriculumReqDto,
  })
  @UseInterceptors(AnyFilesInterceptor())
  async syncCurriculum(
    @Param('courseId') courseId: string,
    @Body() reqDto: UpdateCourseCurriculumReqDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<void> {
    console.log(files)
    return this.coursesService.syncCurriculum(courseId, reqDto, files);
  }
}
