import { Expose } from 'class-transformer';

import {
  BooleanField,
  EnumField,
  NumberField,
  StringField,
  StringFieldOptional,
  UUIDField,
} from '../../../decorators/field.decorators';

import { LessonType } from './lesson-type.enum';

export class CourseDetailLessonResDto {
  @UUIDField({ description: 'ID bai hoc' })
  @Expose()
  id: string;

  @UUIDField({ description: 'ID chuong hoc' })
  @Expose()
  sectionId: string;

  @StringField({ description: 'Ten bai hoc' })
  @Expose()
  title: string;

  @StringFieldOptional({ description: 'Tom tat bai hoc' })
  @Expose()
  summary?: string | null;

  @EnumField(() => LessonType, { description: 'Loai bai hoc' })
  @Expose()
  lessonType: LessonType;

  @NumberField({ description: 'Thoi luong bai hoc', int: true, min: 0 })
  @Expose()
  durationMinutes: number;

  @NumberField({ description: 'Thu tu bai hoc', int: true, min: 1 })
  @Expose()
  position: number;

  @BooleanField({ description: 'Cho phep hoc thu' })
  @Expose()
  isPreview: boolean;

  @BooleanField({ description: 'Trang thai xuat ban' })
  @Expose()
  isPublished: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
