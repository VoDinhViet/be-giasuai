import { Expose } from 'class-transformer';

import {
  BooleanField,
  EnumField,
  NumberField,
  StringField,
  StringFieldOptional,
  URLFieldOptional,
  UUIDField,
  UUIDFieldOptional,
} from '@/decorators/field.decorators';
import { CourseLevel } from './course-level.enum';

export class CourseResDto {
  @UUIDField({ description: 'ID khoa hoc' })
  @Expose()
  id: string;

  @StringField({ description: 'Ten khoa hoc' })
  @Expose()
  title: string;

  @StringField({ description: 'Slug khoa hoc' })
  @Expose()
  slug: string;

  @StringFieldOptional({ description: 'Mo ta khoa hoc' })
  @Expose()
  description?: string | null;

  @StringFieldOptional({ description: 'Mo ta ngan khoa hoc' })
  @Expose()
  shortDescription?: string | null;

  @URLFieldOptional({ description: 'Anh dai dien khoa hoc' })
  @Expose()
  thumbnailUrl?: string | null;

  @URLFieldOptional({ description: 'Video gioi thieu khoa hoc' })
  @Expose()
  introVideoUrl?: string | null;

  @UUIDFieldOptional({ description: 'ID giao vien phu trach' })
  @Expose()
  teacherId?: string | null;

  @EnumField(() => CourseLevel, { description: 'Cap do khoa hoc' })
  @Expose()
  level: CourseLevel;

  @NumberField({ description: 'Hoc phi khoa hoc', int: true, min: 0 })
  @Expose()
  price: number;

  @NumberField({
    description: 'Tong thoi luong uoc tinh theo phut',
    int: true,
    min: 0,
  })
  @Expose()
  estimatedDurationMinutes: number;

  @StringFieldOptional({ description: 'Danh sach tag khoa hoc', each: true })
  @Expose()
  tags: string[];

  @StringFieldOptional({
    description: 'Danh sach muc tieu dau ra',
    each: true,
  })
  @Expose()
  learningOutcomes: string[];

  @BooleanField({ description: 'Trang thai xuat ban' })
  @Expose()
  isPublished: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
