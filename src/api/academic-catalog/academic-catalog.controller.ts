import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiPublic } from '../../decorators/http.decorators';
import { AcademicCatalogService } from './academic-catalog.service';
import { AcademicCatalogItemResDto } from './dto/academic-catalog-item.res.dto';
import { AcademicSubjectResDto } from './dto/academic-subject.res.dto';
import { GetAcademicSubjectsReqDto } from './dto/get-academic-subjects.req.dto';

@ApiTags('academic-catalog')
@Controller({
  path: 'academic-catalog',
  version: '1',
})
export class AcademicCatalogController {
  constructor(
    private readonly academicCatalogService: AcademicCatalogService,
  ) {}

  @Get('school-levels')
  @ApiPublic({
    summary: 'Lấy danh sách cấp học',
    isArray: true,
  })
  getSchoolLevels() {
    return this.academicCatalogService.getSchoolLevels();
  }

  @Get('grades')
  @ApiPublic({
    summary: 'Lấy danh sách khối lớp',
    isArray: true,
  })
  getGrades(@Query('schoolLevelCode') schoolLevelCode?: string) {
    return this.academicCatalogService.getGrades(schoolLevelCode);
  }

  @Get('majors')
  @ApiPublic({
    summary: 'Lấy danh sách chuyên ngành',
    isArray: true,
  })
  getMajors(@Query('schoolLevelCode') schoolLevelCode?: string) {
    return this.academicCatalogService.getMajors(schoolLevelCode);
  }

  @Get('tree')
  @ApiPublic({
    type: AcademicCatalogItemResDto,
    summary: 'Lấy cây khối lớp, môn học và ngành học',
    isArray: true,
  })
  getTree(): Promise<AcademicCatalogItemResDto[]> {
    return this.academicCatalogService.getTree();
  }

  @Get('subjects')
  @ApiPublic({
    type: AcademicSubjectResDto,
    summary: 'Lay danh sach mon hoc theo cap hoc, khoi lop hoac nganh',
    isArray: true,
  })
  getSubjects(
    @Query() query: GetAcademicSubjectsReqDto,
  ): Promise<AcademicSubjectResDto[]> {
    return this.academicCatalogService.getSubjects(query);
  }
}
