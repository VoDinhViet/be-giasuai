import { Expose } from 'class-transformer';
import { NumberField } from '../../../decorators/field.decorators';
import { CourseResDto } from './course.res.dto';

export class CoursesResDto extends CourseResDto {
  @NumberField({ description: 'So hoc vien dang ky' })
  @Expose()
  learnerCount: number;

  @NumberField({ description: 'So bai hoc' })
  @Expose()
  lessonCount: number;
}
