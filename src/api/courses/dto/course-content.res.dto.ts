import { Expose, Type } from 'class-transformer';

import { CourseResDto } from './course.res.dto';
import { CourseSectionResDto } from './course-section.res.dto';

export class CourseContentResDto extends CourseResDto {
  @Type(() => CourseSectionResDto)
  @Expose()
  sections: CourseSectionResDto[];
}
