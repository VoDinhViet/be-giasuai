import { Expose, Type } from 'class-transformer';

import {
  NumberField,
  StringField,
  StringFieldOptional,
  UUIDField,
} from '..\..\../decorators/field.decorators';

import { CourseDetailLessonResDto } from './course-detail-lesson.res.dto';

export class CourseDetailSectionResDto {
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

  @Type(() => CourseDetailLessonResDto)
  @Expose()
  lessons: CourseDetailLessonResDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
