import { Transform } from 'class-transformer';
import {
  StringFieldOptional,
  URLFieldOptional,
  UUIDFieldOptional,
} from '../../../decorators/field.decorators';

export class UpdateCourseReqDto {
  @StringFieldOptional({ description: 'Tên khóa học' })
  title?: string;

  @StringFieldOptional({ description: 'Mô tả khóa học' })
  description?: string;

  @URLFieldOptional({ description: 'Ảnh đại diện khóa học' })
  thumbnailUrl?: string;

  @StringFieldOptional({
    description: 'Danh sách tag khóa học',
    each: true,
  })
  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  tags?: string[];

  @StringFieldOptional({
    description: 'Danh sách mục tiêu đầu ra',
    each: true,
  })
  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  learningOutcomes?: string[];

  @UUIDFieldOptional({ description: 'ID cấp học' })
  levelId?: string;

  @UUIDFieldOptional({ description: 'ID khối lớp' })
  gradeId?: string;

  @UUIDFieldOptional({ description: 'ID chuyên ngành/khối' })
  majorId?: string;

  @UUIDFieldOptional({ description: 'ID môn học' })
  subjectId?: string;
}
