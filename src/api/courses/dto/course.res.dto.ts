import { Expose } from 'class-transformer';
import {
  NumberField,
  StringField,
  StringFieldOptional,
  UUIDField,
} from '../../../decorators/field.decorators';

export class CourseResDto {
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

  @UUIDField({ description: 'ID nguoi bien soan', nullable: true })
  @Expose()
  authorId: string | null;

  @StringFieldOptional({ description: 'Ten nguoi bien soan', nullable: true })
  @Expose()
  authorName: string | null;

  @StringFieldOptional({ description: 'Mo ta khoa hoc', nullable: true })
  @Expose()
  description: string | null;

  @StringFieldOptional({ description: 'Doi tuong hoc vien', nullable: true })
  @Expose()
  audience: string | null;

  @StringField({ description: 'Cap do khoa hoc' })
  @Expose()
  level: string;

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
