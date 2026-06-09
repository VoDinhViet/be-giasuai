import { Expose } from 'class-transformer';

import { ClassField } from '../../../decorators/field.decorators';
import { LessonPartResDto } from './lesson-part.res.dto';
import { LessonResDto } from './lesson.res.dto';

export class LessonDetailResDto extends LessonResDto {
  @ClassField(() => LessonPartResDto, {
    description: 'Danh sach phan noi dung cua bai hoc',
    each: true,
  })
  @Expose()
  parts: LessonPartResDto[];
}
