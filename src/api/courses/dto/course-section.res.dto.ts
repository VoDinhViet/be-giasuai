import { Exclude, Expose } from 'class-transformer';

import {
  ClassField,
  NumberField,
  StringField,
  UUIDField,
} from '../../../decorators/field.decorators';
import { LessonResDto } from '../../lessons/dto/lesson.res.dto';

@Exclude()
export class CourseSectionResDto {
  @UUIDField({ description: 'ID phan hoc' })
  @Expose()
  id: string;

  @StringField({ description: 'Ma phan hoc' })
  @Expose()
  code: string;

  @StringField({ description: 'Ten phan hoc' })
  @Expose()
  title: string;

  @NumberField({ description: 'Thu tu hien thi' })
  @Expose()
  position: number;

  @ClassField(() => LessonResDto, {
    description: 'Danh sach bai hoc trong phan',
    each: true,
  })
  @Expose()
  lessons: LessonResDto[];
}
