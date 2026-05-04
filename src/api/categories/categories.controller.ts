import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiPublic } from '../../decorators/http.decorators';
import { UUIDQuery } from '../../decorators/uuid-query.decorator';
import { CategoriesService } from './categories.service';
import { CategoryResDto } from './dto/category.res.dto';
import { GetCategorySubjectsReqDto } from './dto/get-category-subjects.req.dto';

@ApiTags('categories')
@Controller({ path: 'categories', version: '1' })
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('levels')
  @ApiPublic({
    type: CategoryResDto,
    isArray: true,
    summary: 'Danh sách cấp học',
  })
  getLevels() {
    return this.categoriesService.getLevels();
  }

  @Get('grades')
  @ApiPublic({
    type: CategoryResDto,
    isArray: true,
    summary: 'Danh sách khối lớp',
  })
  getGrades(@UUIDQuery('levelId') levelId?: string) {
    return this.categoriesService.getGrades(levelId);
  }

  @Get('majors')
  @ApiPublic({
    type: CategoryResDto,
    isArray: true,
    summary: 'Danh sách chuyên ngành',
  })
  getMajors(@UUIDQuery('levelId') levelId?: string) {
    return this.categoriesService.getMajors(levelId);
  }

  @Get('subjects')
  @ApiPublic({
    type: CategoryResDto,
    isArray: true,
    summary: 'Danh sách môn học',
  })
  getSubjects(@Query() query: GetCategorySubjectsReqDto) {
    return this.categoriesService.getSubjects(query);
  }
}
