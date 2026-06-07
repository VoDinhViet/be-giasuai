import {
  BooleanFieldOptional,
  EnumField,
  NumberField,
  StringField,
  StringFieldOptional,
  URLFieldOptional,
  UUIDField,
} from '../../../decorators/field.decorators';
import {
  ClassFormat,
  ClassJoinPolicy,
  ClassStatus,
  ClassWeekday,
} from '../constants/class.constant';

export class CreateClassReqDto {
  @StringField({ description: 'Ten lop hoc' })
  name!: string;

  @UUIDField({ description: 'ID giang vien' })
  instructorId!: string;

  @NumberField({ description: 'Si so toi da', min: 1, max: 500, int: true })
  maxStudents!: number;

  @URLFieldOptional({ description: 'Link hoc online', maxLength: 500 })
  meetingUrl?: string;

  @StringFieldOptional({ description: 'Ngay bat dau yyyy-MM-dd' })
  startDate?: string;

  @StringFieldOptional({ description: 'Ngay ket thuc yyyy-MM-dd' })
  endDate?: string;

  @StringField({ description: 'Gio bat dau HH:mm', maxLength: 8 })
  startTime!: string;

  @StringField({ description: 'Gio ket thuc HH:mm', maxLength: 8 })
  endTime!: string;

  @EnumField(() => ClassWeekday, {
    description: 'Danh sach ngay hoc trong tuan',
    each: true,
  })
  repeatDays!: ClassWeekday[];

  @EnumField(() => ClassStatus, { description: 'Trang thai lop hoc' })
  status!: ClassStatus;

  @EnumField(() => ClassFormat, { description: 'Hinh thuc hoc' })
  format!: ClassFormat;

  @EnumField(() => ClassJoinPolicy, { description: 'Cach tham gia lop' })
  joinPolicy!: ClassJoinPolicy;

  @BooleanFieldOptional({ description: 'Cho phep danh sach cho' })
  waitlistEnabled?: boolean;

  @BooleanFieldOptional({ description: 'Gui nhac lich truoc buoi hoc' })
  reminderEnabled?: boolean;

  @BooleanFieldOptional({ description: 'Tu dong sinh buoi hoc' })
  autoCreateSessions?: boolean;

  @StringFieldOptional({ description: 'Ghi chu van hanh', maxLength: 1000 })
  note?: string;
}
