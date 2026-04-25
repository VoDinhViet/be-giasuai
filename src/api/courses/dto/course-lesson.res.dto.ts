import { Expose, Type } from 'class-transformer';

import {
  BooleanField,
  EnumField,
  NumberField,
  StringField,
  StringFieldOptional,
  URLFieldOptional,
  UUIDField,
} from '@/decorators/field.decorators';

import { CourseResourceResDto } from './course-resource.res.dto';
import { LessonType } from './lesson-type.enum';

export class CourseLessonResDto {
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

  @StringFieldOptional({ description: 'Noi dung bai hoc' })
  @Expose()
  content?: string | null;

  @URLFieldOptional({ description: 'Link video bai hoc' })
  @Expose()
  videoUrl?: string | null;

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

  @Type(() => CourseResourceResDto)
  @Expose()
  resources: CourseResourceResDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
