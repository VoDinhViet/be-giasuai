import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtPayloadType } from '..\../api/auth/types/jwt-payload.type';
import { OffsetPaginatedDto } from '..\../common/offset-pagination/paginated.dto';
import { Role } from '..\../constants/role.constant';
import { ApiAuth, ApiPublic } from '..\../decorators/http.decorators';
import { Roles } from '..\../decorators/roles.decorator';
import { User } from '..\../decorators/user.decorator';

import { CoursesService } from './courses.service';
import { CourseContentResDto } from './dto/course-content.res.dto';
import { CourseDetailResDto } from './dto/course-detail.res.dto';
import { CourseLessonResDto } from './dto/course-lesson.res.dto';
import { CourseResourceResDto } from './dto/course-resource.res.dto';
import { CourseResDto } from './dto/course.res.dto';
import { CourseSectionResDto } from './dto/course-section.res.dto';
import { CreateCourseReqDto } from './dto/create-course.req.dto';
import { CreateCourseLessonReqDto } from './dto/create-course-lesson.req.dto';
import { CreateCourseResourceReqDto } from './dto/create-course-resource.req.dto';
import { CreateCourseSectionReqDto } from './dto/create-course-section.req.dto';
import { GetCoursesReqDto } from './dto/get-courses.req.dto';
import { UpdateCourseLessonReqDto } from './dto/update-course-lesson.req.dto';
import { UpdateCourseResourceReqDto } from './dto/update-course-resource.req.dto';
import { UpdateCourseSectionReqDto } from './dto/update-course-section.req.dto';

@ApiTags('courses')
@Controller({
  path: 'courses',
  version: '1',
})
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiAuth({
    type: CourseResDto,
    summary: 'Tạo khóa học',
    statusCode: 201,
  })
  createCourse(@Body() createCourseDto: CreateCourseReqDto) {
    return this.coursesService.createCourse(createCourseDto);
  }

  @Get()
  @ApiPublic({
    type: CourseResDto,
    summary: 'Lấy danh sách khóa học',
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

  @Get(':courseId/content')
  @Roles(Role.ADMIN, Role.TEACHER, Role.USER)
  @ApiAuth({
    type: CourseContentResDto,
    summary: 'Lấy nội dung đầy đủ của khóa học',
  })
  getCourseContent(
    @Param('courseId') courseId: string,
    @User() payload: JwtPayloadType,
  ): Promise<CourseContentResDto> {
    return this.coursesService.getCourseContent(courseId, payload);
  }

  @Post(':courseId/sections')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiAuth({
    type: CourseSectionResDto,
    summary: 'Tạo chương học cho khóa học',
    statusCode: 201,
  })
  createSection(
    @Param('courseId') courseId: string,
    @Body() dto: CreateCourseSectionReqDto,
    @User() payload: JwtPayloadType,
  ): Promise<CourseSectionResDto> {
    return this.coursesService.createSection(courseId, dto, payload);
  }

  @Patch(':courseId/sections/:sectionId')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiAuth({
    type: CourseSectionResDto,
    summary: 'Cập nhật chương học',
  })
  updateSection(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateCourseSectionReqDto,
    @User() payload: JwtPayloadType,
  ): Promise<CourseSectionResDto> {
    return this.coursesService.updateSection(courseId, sectionId, dto, payload);
  }

  @Delete(':courseId/sections/:sectionId')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiAuth({
    summary: 'Xóa chương học',
  })
  deleteSection(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @User() payload: JwtPayloadType,
  ): Promise<void> {
    return this.coursesService.deleteSection(courseId, sectionId, payload);
  }

  @Post(':courseId/sections/:sectionId/lessons')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiAuth({
    type: CourseLessonResDto,
    summary: 'Tạo bài học cho chương học',
    statusCode: 201,
  })
  createLesson(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: CreateCourseLessonReqDto,
    @User() payload: JwtPayloadType,
  ): Promise<CourseLessonResDto> {
    return this.coursesService.createLesson(courseId, sectionId, dto, payload);
  }

  @Patch(':courseId/sections/:sectionId/lessons/:lessonId')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiAuth({
    type: CourseLessonResDto,
    summary: 'Cập nhật bài học',
  })
  updateLesson(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateCourseLessonReqDto,
    @User() payload: JwtPayloadType,
  ): Promise<CourseLessonResDto> {
    return this.coursesService.updateLesson(
      courseId,
      sectionId,
      lessonId,
      dto,
      payload,
    );
  }

  @Delete(':courseId/sections/:sectionId/lessons/:lessonId')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiAuth({
    summary: 'Xóa bài học',
  })
  deleteLesson(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Param('lessonId') lessonId: string,
    @User() payload: JwtPayloadType,
  ): Promise<void> {
    return this.coursesService.deleteLesson(
      courseId,
      sectionId,
      lessonId,
      payload,
    );
  }

  @Post(':courseId/sections/:sectionId/lessons/:lessonId/resources')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiAuth({
    type: CourseResourceResDto,
    summary: 'Tạo tài nguyên cho bài học',
    statusCode: 201,
  })
  createResource(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateCourseResourceReqDto,
    @User() payload: JwtPayloadType,
  ): Promise<CourseResourceResDto> {
    return this.coursesService.createResource(
      courseId,
      sectionId,
      lessonId,
      dto,
      payload,
    );
  }

  @Patch(
    ':courseId/sections/:sectionId/lessons/:lessonId/resources/:resourceId',
  )
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiAuth({
    type: CourseResourceResDto,
    summary: 'Cập nhật tài nguyên bài học',
  })
  updateResource(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Param('lessonId') lessonId: string,
    @Param('resourceId') resourceId: string,
    @Body() dto: UpdateCourseResourceReqDto,
    @User() payload: JwtPayloadType,
  ): Promise<CourseResourceResDto> {
    return this.coursesService.updateResource(
      courseId,
      sectionId,
      lessonId,
      resourceId,
      dto,
      payload,
    );
  }

  @Delete(
    ':courseId/sections/:sectionId/lessons/:lessonId/resources/:resourceId',
  )
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiAuth({
    summary: 'Xóa tài nguyên bài học',
  })
  deleteResource(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Param('lessonId') lessonId: string,
    @Param('resourceId') resourceId: string,
    @User() payload: JwtPayloadType,
  ): Promise<void> {
    return this.coursesService.deleteResource(
      courseId,
      sectionId,
      lessonId,
      resourceId,
      payload,
    );
  }
}
