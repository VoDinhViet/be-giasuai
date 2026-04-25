import {
  BooleanFieldOptional,
  EnumFieldOptional,
  NumberFieldOptional,
  StringFieldOptional,
  URLFieldOptional,
} from '@/decorators/field.decorators';

import { LessonType } from './lesson-type.enum';

export class UpdateCourseLessonReqDto {
  @StringFieldOptional({ description: 'Ten bai hoc' })
  title?: string;

  @StringFieldOptional({ description: 'Tom tat bai hoc' })
  summary?: string;

  @StringFieldOptional({ description: 'Noi dung bai hoc' })
  content?: string;

  @URLFieldOptional({ description: 'Link video bai hoc' })
  videoUrl?: string;

  @EnumFieldOptional(() => LessonType, { description: 'Loai bai hoc' })
  lessonType?: LessonType;

  @NumberFieldOptional({
    description: 'Thoi luong bai hoc theo phut',
    int: true,
    min: 0,
  })
  durationMinutes?: number;

  @NumberFieldOptional({
    description: 'Thu tu hien thi cua bai hoc',
    int: true,
    min: 1,
  })
  position?: number;

  @BooleanFieldOptional({ description: 'Cho phep hoc thu bai hoc' })
  isPreview?: boolean;

  @BooleanFieldOptional({ description: 'Trang thai xuat ban bai hoc' })
  isPublished?: boolean;
}
