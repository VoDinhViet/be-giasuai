import { Expose, Type } from 'class-transformer';

import { CourseResDto } from './course.res.dto';
import { CourseDetailSectionResDto } from './course-detail-section.res.dto';

export class CourseDetailResDto extends CourseResDto {
  @Type(() => CourseDetailSectionResDto)
  @Expose()
  sections: CourseDetailSectionResDto[];
}
