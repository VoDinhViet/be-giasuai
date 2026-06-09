import { Exclude, Expose } from 'class-transformer';
import {
  ClassField,
  NumberField,
  StringField,
  StringFieldOptional,
  UUIDField,
} from '../../../decorators/field.decorators';
import { UserResDto } from '../../users/dto/user.res.dto';
import { LessonResDto } from '../../lessons/dto/lesson.res.dto';

@Exclude()
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

  @ClassField(() => UserResDto, {
    description: 'Thong tin nguoi bien soan',
    nullable: true,
  })
  @Expose()
  author: UserResDto | null;

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

  @ClassField(() => LessonResDto, {
    description: 'Danh sach bai hoc',
    each: true,
    nullable: true,
  })
  @Expose()
  lessons?: LessonResDto[];
}
