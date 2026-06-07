import { Expose } from 'class-transformer';
import {
  NumberField,
  StringField,
  StringFieldOptional,
  UUIDField,
} from '../../../decorators/field.decorators';

export class CourseListItemResDto {
  @UUIDField({ description: 'ID khoa hoc' })
  @Expose()
  id: string;

  @StringField({ description: 'Ma khoa hoc' })
  @Expose()
  code: string;

  @StringField({ description: 'Ten khoa hoc' })
  @Expose()
  name: string;

  @StringField({ description: 'Danh muc khoa hoc' })
  @Expose()
  category: string;

  @StringFieldOptional({ description: 'Ten nguoi bien soan', nullable: true })
  @Expose()
  authorName: string | null;

  @NumberField({ description: 'So hoc vien dang ky' })
  @Expose()
  learnerCount: number;

  @NumberField({ description: 'So bai hoc' })
  @Expose()
  lessonCount: number;

  @NumberField({ description: 'Thoi luong khoa hoc theo phut' })
  @Expose()
  durationMinutes: number;

  @StringFieldOptional({ description: 'Ngay khai giang', nullable: true })
  @Expose()
  startDate: string | null;

  @StringField({ description: 'Trang thai khoa hoc' })
  @Expose()
  status: string;
}
