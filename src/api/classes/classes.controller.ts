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

import { PageOptionsDto } from '@/common/offset-pagination/page-options.dto';
import { OffsetPaginatedDto } from '@/common/offset-pagination/paginated.dto';
import { Role } from '@/constants/role.constant';
import { ApiAuth, ApiPublic } from '@/decorators/http.decorators';
import { UUIDParam } from '@/decorators/param.decorators';
import { Roles } from '@/decorators/roles.decorator';
import { User } from '@/decorators/user.decorator';

import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import { ClassesService } from './classes.service';
import { ClassDetailResDto } from './dto/class-detail.res.dto';
import { ClassResDto } from './dto/class.res.dto';
import { CreateClassReqDto } from './dto/create-class.req.dto';
import { GetClassesReqDto } from './dto/get-classes.req.dto';
import { UpdateClassReqDto } from './dto/update-class.req.dto';
import { JoinClassReqDto } from './dto/join-class.req.dto';
import { ClassStatisticsResDto } from './dto/class-statistics.res.dto';
import { ClassDetailStatisticsResDto } from './dto/class-detail-statistics.res.dto';
import { CourseResDto } from '../courses/dto/course.res.dto';
import { UserResDto } from '../users/dto/user.res.dto';

@ApiTags('classes')
@Controller({
  path: 'classes',
  version: '1',
})
export class ClassesController {
  constructor(private readonly classesService: ClassesService) { }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER, Role.USER)
  @ApiAuth({
    type: ClassResDto,
    summary: 'Lấy danh sách lớp học',
    isPaginated: true,
    paginationType: 'offset',
  })
  getClasses(
    @Query() pageOptions: GetClassesReqDto,
    @User() payload: JwtPayloadType,
  ): Promise<OffsetPaginatedDto<ClassResDto>> {
    return this.classesService.getClasses(pageOptions, payload);
  }

  @Get('statistics')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiAuth({
    type: ClassStatisticsResDto,
    summary: 'Lấy thống kê lớp học',
  })
  getStatistics(
    @User() payload: JwtPayloadType,
  ): Promise<ClassStatisticsResDto> {
    return this.classesService.getStatistics(payload);
  }

  @Post()
  @Roles(Role.TEACHER)
  @ApiAuth({
    type: ClassResDto,
    summary: 'Tạo lớp học',
    statusCode: 201,
  })
  createClass(
    @Body() reqDto: CreateClassReqDto,
    @User() payload: JwtPayloadType,
  ): Promise<ClassResDto> {
    return this.classesService.createClass(reqDto, payload);
  }

  @Get('code/:code')
  @ApiPublic({
    type: ClassResDto,
    summary: 'Lấy thông tin lớp học theo mã lớp',
  })
  getClassByCode(@Param('code') code: string): Promise<ClassResDto> {
    return this.classesService.getClassByCode(code);
  }

  @Get(':classId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.USER)
  @ApiAuth({
    type: ClassDetailResDto,
    summary: 'Lấy chi tiết lớp học',
  })
  getClass(
    @UUIDParam('classId') classId: string,
    @User() payload: JwtPayloadType,
  ): Promise<ClassDetailResDto> {
    return this.classesService.getClass(classId, payload);
  }

  @Get(':classId/stats')
  @Roles(Role.ADMIN, Role.TEACHER, Role.USER)
  @ApiAuth({
    type: ClassDetailStatisticsResDto,
    summary: 'Lấy thống kê dashboard của lớp học',
  })
  getClassDetailStats(
    @UUIDParam('classId') classId: string,
    @User() payload: JwtPayloadType,
  ): Promise<ClassDetailStatisticsResDto> {
    return this.classesService.getClassDetailStats(classId, payload);
  }

  @Patch(':classId')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiAuth({
    type: ClassResDto,
    summary: 'Cập nhật lớp học',
  })
  updateClass(
    @UUIDParam('classId') classId: string,
    @Body() updateClassDto: UpdateClassReqDto,
    @User() payload: JwtPayloadType,
  ): Promise<ClassResDto> {
    return this.classesService.updateClass(classId, updateClassDto, payload);
  }

  @Delete(':classId')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiAuth({
    summary: 'Xóa lớp học',
  })
  deleteClass(
    @UUIDParam('classId') classId: string,
    @User() payload: JwtPayloadType,
  ): Promise<void> {
    return this.classesService.deleteClass(classId, payload);
  }

  @Post('join/:inviteCode')
  @Roles(Role.ADMIN, Role.TEACHER, Role.USER)
  @ApiAuth({
    summary: 'Tham gia lớp học bằng mã mời',
  })
  joinClass(
    @Param('inviteCode') inviteCode: string,
    @User() payload: JwtPayloadType,
  ): Promise<void> {
    return this.classesService.joinClass(inviteCode, payload);
  }

  @Post(':classId/courses/:courseId')
  @Roles(Role.TEACHER)
  @ApiAuth({
    summary: 'Gán khóa học vào lớp học',
    statusCode: 201,
  })
  assignCourseToClass(
    @UUIDParam('classId') classId: string,
    @UUIDParam('courseId') courseId: string,
    @User() payload: JwtPayloadType,
  ): Promise<void> {
    return this.classesService.assignCourseToClass(classId, courseId, payload);
  }

  @Get(':classId/courses')
  @Roles(Role.ADMIN, Role.TEACHER, Role.USER)
  @ApiAuth({
    type: CourseResDto,
    summary: 'Lay danh sach khoa hoc thuoc lop',
    isPaginated: true,
    paginationType: 'offset',
  })
  getCoursesByClass(
    @UUIDParam('classId') classId: string,
    @Query() pageOptions: PageOptionsDto,
    @User() payload: JwtPayloadType,
  ): Promise<OffsetPaginatedDto<CourseResDto>> {
    return this.classesService.getCoursesByClass(classId, pageOptions, payload);
  }

  @Get(':classId/course-ids')
  @Roles(Role.ADMIN, Role.TEACHER, Role.USER)
  @ApiAuth({
    type: String,
    isArray: true,
    summary: 'Lấy danh sách ID các khóa học đã gán vào lớp',
  })
  getAssignedCourseIds(
    @UUIDParam('classId') classId: string,
    @User() payload: JwtPayloadType,
  ): Promise<string[]> {
    return this.classesService.getAssignedCourseIds(classId, payload);
  }

  @Get(':classId/students')
  @Roles(Role.ADMIN, Role.TEACHER, Role.USER)
  @ApiAuth({
    type: UserResDto,
    summary: 'Lấy danh sách học sinh trong lớp',
    isPaginated: true,
    paginationType: 'offset',
  })
  getStudents(
    @UUIDParam('classId') classId: string,
    @Query() pageOptions: PageOptionsDto,
    @User() payload: JwtPayloadType,
  ): Promise<OffsetPaginatedDto<UserResDto>> {
    return this.classesService.getStudents(classId, pageOptions, payload);
  }
}
