import { Expose } from 'class-transformer';

import {
  EnumField,
  StringField,
  StringFieldOptional,
  UUIDField,
  UUIDFieldOptional,
} from '../../../decorators/field.decorators';
import { ClassSessionStatus } from '../constants/class.constant';

export class ClassSessionResDto {
  @UUIDField({ description: 'ID buoi hoc' })
  @Expose()
  id!: string;

  @StringField({ description: 'Ma buoi hoc' })
  @Expose()
  code!: string;

  @StringField({ description: 'Ten/noi dung buoi hoc' })
  @Expose()
  title!: string;

  @UUIDFieldOptional({ description: 'ID khoa hoc', nullable: true })
  @Expose()
  courseId!: string | null;

  @StringFieldOptional({ description: 'Ten khoa hoc', nullable: true })
  @Expose()
  courseName!: string | null;

  @UUIDFieldOptional({ description: 'ID giang vien', nullable: true })
  @Expose()
  instructorId!: string | null;

  @StringFieldOptional({ description: 'Ten giang vien', nullable: true })
  @Expose()
  instructorName!: string | null;

  @StringField({ description: 'Ngay hoc' })
  @Expose()
  sessionDate!: string;

  @StringField({ description: 'Gio bat dau' })
  @Expose()
  startTime!: string;

  @StringField({ description: 'Gio ket thuc' })
  @Expose()
  endTime!: string;

  @StringField({ description: 'Khoang gio hien thi' })
  @Expose()
  timeRange!: string;

  @StringFieldOptional({ description: 'Phong hoc', nullable: true })
  @Expose()
  room!: string | null;

  @EnumField(() => ClassSessionStatus, { description: 'Trang thai buoi hoc' })
  @Expose()
  status!: ClassSessionStatus;
}
