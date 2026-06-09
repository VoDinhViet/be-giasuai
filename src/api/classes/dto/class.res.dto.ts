import { Exclude, Expose } from 'class-transformer';

import {
  BooleanField,
  ClassField,
  DateField,
  EnumField,
  NumberField,
  StringField,
  StringFieldOptional,
  UUIDField,
} from '../../../decorators/field.decorators';
import { UserResDto } from '../../users/dto/user.res.dto';
import {
  ClassFormat,
  ClassJoinPolicy,
  ClassStatus,
  ClassWeekday,
} from '../constants/class.constant';

@Exclude()
export class ClassResDto {
  @UUIDField({ description: 'ID lop hoc' })
  @Expose()
  id!: string;

  @StringField({ description: 'Ma lop hoc' })
  @Expose()
  code!: string;

  @StringField({ description: 'Ten lop hoc' })
  @Expose()
  name!: string;

  @UUIDField({ description: 'ID giang vien' })
  @Expose()
  instructorId!: string;

  @ClassField(() => UserResDto, { description: 'Thong tin giang vien' })
  @Expose()
  instructor!: UserResDto;

  @NumberField({ description: 'Si so toi da' })
  @Expose()
  maxStudents!: number;

  @StringFieldOptional({ description: 'Link hoc online', nullable: true })
  @Expose()
  meetingUrl!: string | null;

  @StringFieldOptional({ description: 'Ngay bat dau', nullable: true })
  @Expose()
  startDate!: string | null;

  @StringFieldOptional({ description: 'Ngay ket thuc', nullable: true })
  @Expose()
  endDate!: string | null;

  @StringFieldOptional({ description: 'Gio bat dau', nullable: true })
  @Expose()
  startTime!: string | null;

  @StringFieldOptional({ description: 'Gio ket thuc', nullable: true })
  @Expose()
  endTime!: string | null;

  @EnumField(() => ClassWeekday, {
    description: 'Danh sach ngay hoc trong tuan',
    each: true,
  })
  @Expose()
  repeatDays!: ClassWeekday[];

  @EnumField(() => ClassStatus, { description: 'Trang thai lop hoc' })
  @Expose()
  status!: ClassStatus;

  @EnumField(() => ClassFormat, { description: 'Hinh thuc hoc' })
  @Expose()
  format!: ClassFormat;

  @EnumField(() => ClassJoinPolicy, { description: 'Cach tham gia lop' })
  @Expose()
  joinPolicy!: ClassJoinPolicy;

  @BooleanField({ description: 'Cho phep danh sach cho' })
  @Expose()
  waitlistEnabled!: boolean;

  @BooleanField({ description: 'Gui nhac lich truoc buoi hoc' })
  @Expose()
  reminderEnabled!: boolean;

  @BooleanField({ description: 'Tu dong sinh buoi hoc' })
  @Expose()
  autoCreateSessions!: boolean;

  @StringFieldOptional({ description: 'Ghi chu van hanh', nullable: true })
  @Expose()
  note!: string | null;

  @DateField({ description: 'Thoi diem tao lop' })
  @Expose()
  createdAt!: Date;

  @DateField({ description: 'Thoi diem cap nhat lop' })
  @Expose()
  updatedAt!: Date;
}
