import {
  EnumFieldOptional,
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
  URLFieldOptional,
  UUIDFieldOptional,
} from '@/decorators/field.decorators';
import { CourseLevel } from './course-level.enum';

export class CreateCourseReqDto {
  @StringField({ description: 'Ten khoa hoc' })
  title: string;

  @StringFieldOptional({ description: 'Mo ta khoa hoc' })
  description?: string;

  @StringFieldOptional({ description: 'Mo ta ngan khoa hoc' })
  shortDescription?: string;

  @URLFieldOptional({ description: 'Anh dai dien khoa hoc' })
  thumbnailUrl?: string;

  @URLFieldOptional({ description: 'Video gioi thieu khoa hoc' })
  introVideoUrl?: string;

  @UUIDFieldOptional({ description: 'Giao vien phu trach khoa hoc' })
  teacherId?: string;

  @EnumFieldOptional(() => CourseLevel, { description: 'Cap do khoa hoc' })
  level?: CourseLevel;

  @NumberFieldOptional({
    description: 'Hoc phi khoa hoc',
    int: true,
    min: 0,
  })
  price?: number;

  @NumberFieldOptional({
    description: 'Tong thoi luong uoc tinh theo phut',
    int: true,
    min: 0,
  })
  estimatedDurationMinutes?: number;

  @StringFieldOptional({
    description: 'Danh sach tag khoa hoc',
    each: true,
  })
  tags?: string[];

  @StringFieldOptional({
    description: 'Danh sach muc tieu dau ra',
    each: true,
  })
  learningOutcomes?: string[];
}
