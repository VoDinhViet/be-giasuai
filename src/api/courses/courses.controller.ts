import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { OffsetPaginatedDto } from '../../common/offset-pagination/paginated.dto';
import { Role } from '../../constants/role.constant';
import { ApiAuth, ApiPublic } from '../../decorators/http.decorators';
import { Roles } from '../../decorators/roles.decorator';

import { CoursesService } from './courses.service';
import { CourseDetailResDto } from './dto/course-detail.res.dto';
import { CourseSectionWithLessonsResDto } from './dto/course-section-with-lessons.res.dto';
import { CourseResDto } from './dto/course.res.dto';
import { PageCoursesReqDto } from './dto/page-courses.req.dto';

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

  @Get(':courseId/sections')
  @ApiPublic({
    type: CourseSectionWithLessonsResDto,
    summary: 'Lay danh sach chuong va bai hoc cua khoa hoc',
    isArray: true,
  })
  getCourseSections(
    @Param('courseId') courseId: string,
  ): Promise<CourseSectionWithLessonsResDto[]> {
    return this.coursesService.getCourseSections(courseId);
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
}
