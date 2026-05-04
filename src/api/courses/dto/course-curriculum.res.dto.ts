import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CourseDetailSectionResDto } from './course-detail-section.res.dto';

export class CourseCurriculumResDto {
  @ApiProperty({ type: () => CourseDetailSectionResDto, isArray: true })
  @Type(() => CourseDetailSectionResDto)
  @Expose()
  courseSections: CourseDetailSectionResDto[];
}
