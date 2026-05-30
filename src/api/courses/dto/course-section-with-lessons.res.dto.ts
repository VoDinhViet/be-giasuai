import { Expose, Type } from 'class-transformer';

import {
  NumberField,
  StringField,
  StringFieldOptional,
  UUIDField,
} from '../../../decorators/field.decorators';

import { CourseSectionLessonResDto } from './course-section-lesson.res.dto';

export class CourseSectionWithLessonsResDto {
  @UUIDField({ description: 'ID chuong hoc' })
  @Expose()
  id!: string;

  @UUIDField({ description: 'ID khoa hoc' })
  @Expose()
  courseId!: string;

  @StringField({ description: 'Ten chuong hoc' })
  @Expose()
  title!: string;

  @StringFieldOptional({ description: 'Mo ta chuong hoc' })
  @Expose()
  description?: string | null;

  @NumberField({ description: 'Thu tu chuong hoc', int: true, min: 1 })
  @Expose()
  position!: number;

  @Type(() => CourseSectionLessonResDto)
  @Expose()
  lessons!: CourseSectionLessonResDto[];

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
