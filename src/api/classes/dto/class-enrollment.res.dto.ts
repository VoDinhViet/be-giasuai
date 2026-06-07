import { Expose } from 'class-transformer';

import {
  EnumField,
  StringField,
  StringFieldOptional,
  UUIDField,
} from '../../../decorators/field.decorators';
import {
  ClassEnrollmentSource,
  ClassEnrollmentStatus,
} from '../constants/class.constant';

export class ClassEnrollmentResDto {
  @UUIDField({ description: 'ID yeu cau/hoc vien trong lop' })
  @Expose()
  id!: string;

  @UUIDField({ description: 'ID hoc vien' })
  @Expose()
  learnerId!: string;

  @StringField({ description: 'Ma hoc vien' })
  @Expose()
  studentCode!: string;

  @StringField({ description: 'Ten hoc vien' })
  @Expose()
  studentName!: string;

  @StringField({ description: 'Email hoc vien' })
  @Expose()
  email!: string;

  @StringFieldOptional({ description: 'Ghi chu dang ky', nullable: true })
  @Expose()
  note!: string | null;

  @StringField({ description: 'Thoi diem gui yeu cau' })
  @Expose()
  requestedAt!: string;

  @StringFieldOptional({ description: 'Thoi diem duyet', nullable: true })
  @Expose()
  reviewedAt!: string | null;

  @EnumField(() => ClassEnrollmentSource, { description: 'Nguon yeu cau' })
  @Expose()
  source!: ClassEnrollmentSource;

  @EnumField(() => ClassEnrollmentStatus, {
    description: 'Trang thai yeu cau/hoc vien trong lop',
  })
  @Expose()
  status!: ClassEnrollmentStatus;
}
