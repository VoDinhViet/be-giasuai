import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { OffsetPaginatedDto } from '../../common/offset-pagination/paginated.dto';
import { Permission } from '../../constants/permission.constant';
import { ApiAuth } from '../../decorators/http.decorators';
import { Permissions } from '../../decorators/permissions.decorator';
import { CourseListItemResDto } from './dto/course-list-item.res.dto';
import { CourseResDto } from './dto/course.res.dto';
import { CourseStatsResDto } from './dto/course-stats.res.dto';
import { CreateCourseReqDto } from './dto/create-course.req.dto';
import { GetCoursesDto } from './dto/get-courses.dto';
import { UpdateCourseReqDto } from './dto/update-course.req.dto';
import { CoursesService } from './courses.service';

@ApiTags('courses')
@Controller({
  path: 'courses',
  version: '1',
})
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @Permissions(Permission.COURSES_READ)
  @ApiAuth({
    type: CourseListItemResDto,
    summary: 'Lay danh sach khoa hoc',
    isPaginated: true,
    paginationType: 'offset',
  })
  getCourses(
    @Query() pageOptions: GetCoursesDto,
  ): Promise<OffsetPaginatedDto<CourseListItemResDto>> {
    return this.coursesService.getCourses(pageOptions);
  }

  @Get('stats')
  @Permissions(Permission.COURSES_READ)
  @ApiAuth({
    type: CourseStatsResDto,
    summary: 'Lay thong ke khoa hoc',
  })
  getStats(): Promise<CourseStatsResDto> {
    return this.coursesService.getStats();
  }

  @Post()
  @Permissions(Permission.COURSES_MANAGE)
  @ApiAuth({
    type: CourseResDto,
    summary: 'Tao khoa hoc',
  })
  createCourse(@Body() reqDto: CreateCourseReqDto): Promise<CourseResDto> {
    return this.coursesService.create(reqDto);
  }

  @Get(':courseCode')
  @Permissions(Permission.COURSES_READ)
  @ApiAuth({
    type: CourseResDto,
    summary: 'Lay chi tiet khoa hoc',
  })
  getCourse(@Param('courseCode') courseCode: string): Promise<CourseResDto> {
    return this.coursesService.getCourseByCode(courseCode);
  }

  @Patch(':courseCode')
  @Permissions(Permission.COURSES_MANAGE)
  @ApiAuth({
    type: CourseResDto,
    summary: 'Cap nhat khoa hoc',
  })
  updateCourse(
    @Param('courseCode') courseCode: string,
    @Body() reqDto: UpdateCourseReqDto,
  ): Promise<CourseResDto> {
    return this.coursesService.update(courseCode, reqDto);
  }
}
