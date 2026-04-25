import { Expose } from 'class-transformer';

import {
  BooleanField,
  NumberField,
  StringField,
} from '..\..\../decorators/field.decorators';

export class ClassDetailStatisticsResDto {
  @NumberField({
    description: 'Sĩ số học viên',
    int: true,
    min: 0,
  })
  @Expose()
  studentCount: number;

  @NumberField({
    description: 'Số lượng khóa học trong lớp',
    int: true,
    min: 0,
  })
  @Expose()
  courseCount: number;

  @StringField({ description: 'Mã mời lớp học' })
  @Expose()
  inviteCode: string;

  @BooleanField({ description: 'Trạng thái hoạt động' })
  @Expose()
  isActive: boolean;
}
