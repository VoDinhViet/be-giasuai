import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
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
import { CourseResDto } from '../courses/dto/course.res.dto';
import { UserResDto } from '../users/dto/user.res.dto';
import { ClassesService } from './classes.service';
import { AssignClassCourseReqDto } from './dto/assign-class-course.req.dto';
import { ClassCourseStatsResDto } from './dto/class-course-stats.res.dto';
import { ClassEnrollmentResDto } from './dto/class-enrollment.res.dto';
import { ClassResDto } from './dto/class.res.dto';
import { ClassSessionResDto } from './dto/class-session.res.dto';
import { ClassStatsResDto } from './dto/class-stats.res.dto';
import { CreateClassReqDto } from './dto/create-class.req.dto';
import { GetClassCoursesDto } from './dto/get-class-courses.dto';
import { GetClassLearnersDto } from './dto/get-class-learners.dto';
import { GetClassesDto } from './dto/get-classes.dto';
import { InviteUserToClassReqDto } from './dto/invite-user-to-class.req.dto';
import { UnassignedClassCourseResDto } from './dto/unassigned-class-course.res.dto';
import { UpdateClassEnrollmentStatusReqDto } from './dto/update-class-enrollment-status.req.dto';

@ApiTags('classes')
@Controller({
  path: 'classes',
  version: '1',
})
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  @ApiAuth({
    type: ClassResDto,
    summary: 'Lay danh sach lop hoc',
    isPaginated: true,
    paginationType: 'offset',
  })
  getClasses(
    @Query() pageOptions: GetClassesDto,
  ): Promise<OffsetPaginatedDto<ClassResDto>> {
    return this.classesService.getClasses(pageOptions);
  }

  @Get('stats')
  @Permissions(Permission.CLASSES_READ)
  @ApiAuth({
    type: ClassStatsResDto,
    summary: 'Lay thong ke lop hoc',
  })
  getStats(): Promise<ClassStatsResDto> {
    return this.classesService.getStats();
  }

  @Post()
  @Permissions(Permission.CLASSES_MANAGE)
  @ApiAuth({
    type: ClassResDto,
    summary: 'Tao lop hoc',
  })
  createClass(@Body() reqDto: CreateClassReqDto): Promise<ClassResDto> {
    return this.classesService.create(reqDto);
  }

  @Get(':classCode/courses/stats')
  @Permissions(Permission.CLASSES_MANAGE)
  @ApiAuth({
    type: ClassCourseStatsResDto,
    summary: 'Lay thong ke khoa hoc cua lop',
  })
  getClassCourseStats(
    @Param('classCode') classCode: string,
  ): Promise<ClassCourseStatsResDto> {
    return this.classesService.getClassCourseStats(classCode);
  }

  @Get(':classCode/unassigned-courses')
  @Permissions(Permission.CLASSES_MANAGE)
  @ApiAuth({
    type: UnassignedClassCourseResDto,
    summary: 'Lay danh sach khoa hoc chua gan vao lop',
    isPaginated: true,
    paginationType: 'offset',
  })
  getUnassignedClassCourses(
    @Param('classCode') classCode: string,
    @Query() pageOptions: GetClassCoursesDto,
  ): Promise<OffsetPaginatedDto<UnassignedClassCourseResDto>> {
    return this.classesService.getUnassignedClassCourses(
      classCode,
      pageOptions, 
    );
  }

  @Get(':classCode/courses')
  @Permissions(Permission.CLASSES_MANAGE)
  @ApiAuth({
    type: CourseResDto,
    summary: 'Lay danh sach khoa hoc trong lop',
    isPaginated: true,
    paginationType: 'offset',
  })
  getClassCourses(
    @Param('classCode') classCode: string,
    @Query() pageOptions: GetClassCoursesDto,
  ): Promise<OffsetPaginatedDto<CourseResDto>> {
    return this.classesService.getClassCourses(classCode, pageOptions);
  }

  @Post(':classCode/courses')
  @Permissions(Permission.CLASSES_MANAGE)
  @ApiAuth({
    type: CourseResDto,
    summary: 'Them khoa hoc vao lop',
  })
  assignClassCourse(
    @Param('classCode') classCode: string,
    @Body() reqDto: AssignClassCourseReqDto,
  ): Promise<CourseResDto> {
    return this.classesService.assignClassCourse(classCode, reqDto);
  }

  @Get(':classCode/learners')
  @Permissions(Permission.CLASSES_MANAGE)
  @ApiAuth({
    type: UserResDto,
    summary: 'Lay danh sach hoc vien trong lop',
    isPaginated: true,
    paginationType: 'offset',
  })
  getClassLearners(
    @Param('classCode') classCode: string,
    @Query() pageOptions: GetClassLearnersDto,
  ): Promise<OffsetPaginatedDto<UserResDto>> {
    return this.classesService.getClassLearners(classCode, pageOptions);
  }

  @Get(':classCode/sessions')
  @Permissions(Permission.CLASSES_MANAGE)
  @ApiAuth({
    type: ClassSessionResDto,
    summary: 'Lay danh sach buoi hoc cua lop',
    isArray: true,
  })
  getClassSessions(
    @Param('classCode') classCode: string,
  ): Promise<ClassSessionResDto[]> {
    return this.classesService.getSessions(classCode);
  }

  @Get(':classCode/enrollments')
  @Permissions(Permission.CLASSES_MANAGE)
  @ApiAuth({
    type: ClassEnrollmentResDto,
    summary: 'Lay danh sach yeu cau ghi danh lop hoc',
    isArray: true,
  })
  getClassEnrollments(
    @Param('classCode') classCode: string,
  ): Promise<ClassEnrollmentResDto[]> {
    return this.classesService.getEnrollments(classCode);
  }

  @Post(':classCode/enrollments/invite')
  @Permissions(Permission.CLASSES_MANAGE)
  @ApiAuth({
    type: ClassEnrollmentResDto,
    summary: 'Moi hoc vien vao lop',
  })
  inviteUserToClass(
    @Param('classCode') classCode: string,
    @Body() reqDto: InviteUserToClassReqDto,
  ): Promise<ClassEnrollmentResDto> {
    return this.classesService.inviteUser(classCode, reqDto);
  }

  @Patch(':classCode/enrollments/:enrollmentId/status')
  @Permissions(Permission.CLASSES_MANAGE)
  @ApiAuth({
    type: ClassEnrollmentResDto,
    summary: 'Cap nhat trang thai yeu cau ghi danh',
  })
  updateClassEnrollmentStatus(
    @Param('classCode') classCode: string,
    @Param('enrollmentId') enrollmentId: string,
    @Body() reqDto: UpdateClassEnrollmentStatusReqDto,
  ): Promise<ClassEnrollmentResDto> {
    return this.classesService.updateEnrollmentStatus(
      classCode,
      enrollmentId,
      reqDto,
    );
  }

  @Get(':classCode')
  @Permissions(Permission.CLASSES_MANAGE)
  @ApiAuth({
    type: ClassResDto,
    summary: 'Lay chi tiet lop hoc',
  })
  getClass(@Param('classCode') classCode: string): Promise<ClassResDto> {
    return this.classesService.getClassByCode(classCode);
  }

  @Delete(':classCode')
  @Permissions(Permission.CLASSES_MANAGE)
  @ApiAuth({
    summary: 'Xoa lop hoc',
    statusCode: HttpStatus.NO_CONTENT,
  })
  deleteClass(@Param('classCode') classCode: string): Promise<void> {
    return this.classesService.delete(classCode);
  }
}
