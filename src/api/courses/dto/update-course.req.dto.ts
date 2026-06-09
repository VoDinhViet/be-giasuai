import {
  EnumFieldOptional,
  NumberFieldOptional,
  StringFieldOptional,
  UUIDFieldOptional,
} from '../../../decorators/field.decorators';
import { CourseLevel, CourseStatus } from '../constants/course.constant';

export class UpdateCourseReqDto {
  @StringFieldOptional({ description: 'Ma khoa hoc', maxLength: 32 })
  code?: string;

  @StringFieldOptional({ description: 'Ten khoa hoc' })
  name?: string;

  @StringFieldOptional({ description: 'Danh muc khoa hoc', maxLength: 120 })
  category?: string;

  @UUIDFieldOptional({ description: 'ID nguoi bien soan' })
  authorId?: string;

  @StringFieldOptional({ description: 'Mo ta khoa hoc', maxLength: 2000 })
  description?: string;

  @StringFieldOptional({ description: 'Doi tuong hoc vien', maxLength: 1000 })
  audience?: string;

  @EnumFieldOptional(() => CourseLevel, { description: 'Cap do khoa hoc' })
  level?: CourseLevel;

  @NumberFieldOptional({
    description: 'Thoi luong theo phut',
    min: 0,
    int: true,
  })
  durationMinutes?: number;

  @StringFieldOptional({ description: 'Ngay khai giang yyyy-MM-dd' })
  startDate?: string;

  @EnumFieldOptional(() => CourseStatus, { description: 'Trang thai khoa hoc' })
  status?: CourseStatus;
}
