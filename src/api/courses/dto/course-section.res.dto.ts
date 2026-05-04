import { Expose, Type } from 'class-transformer';

import {
  NumberField,
  StringField,
  StringFieldOptional,
  UUIDField,
} from '../../../decorators/field.decorators';

import { LessonResDto } from './lesson.res.dto';

export class CourseSectionResDto {
  @UUIDField({ description: 'ID chuong hoc' })
  @Expose()
  id: string;

  @UUIDField({ description: 'ID khoa hoc' })
  @Expose()
  courseId: string;

  @StringField({ description: 'Ten chuong hoc' })
  @Expose()
  title: string;

  @StringFieldOptional({ description: 'Mo ta chuong hoc' })
  @Expose()
  description?: string | null;

  @NumberField({ description: 'Thu tu chuong hoc', int: true, min: 1 })
  @Expose()
  position: number;

  @Type(() => LessonResDto)
  @Expose()
  lessons: LessonResDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
