import { Exclude, Expose } from 'class-transformer';

import { ClassField } from '../../../decorators/field.decorators';
import { CourseResDto } from './course.res.dto';
import { CourseObjectiveResDto } from './course-objective.res.dto';
import { CourseSectionResDto } from './course-section.res.dto';

@Exclude()
export class CourseCurriculumResDto extends CourseResDto {
  @ClassField(() => CourseObjectiveResDto, {
    description: 'Danh sach muc tieu khoa hoc',
    each: true,
  })
  @Expose()
  objectives: CourseObjectiveResDto[];

  @ClassField(() => CourseSectionResDto, {
    description: 'Danh sach phan hoc',
    each: true,
  })
  @Expose()
  sections: CourseSectionResDto[];
}
