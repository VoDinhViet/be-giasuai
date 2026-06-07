import { Expose } from 'class-transformer';
import { NumberField } from '../../../decorators/field.decorators';

export class CourseStatsResDto {
  @NumberField({ description: 'Tong so khoa hoc' })
  @Expose()
  total!: number;

  @NumberField({ description: 'So khoa hoc dang mo' })
  @Expose()
  published!: number;

  @NumberField({ description: 'Tong luot hoc vien dang ky' })
  @Expose()
  enrolledLearners!: number;

  @NumberField({ description: 'Tong thoi luong hoc theo phut' })
  @Expose()
  totalDurationMinutes!: number;

  @NumberField({ description: 'So khoa khai giang trong 30 ngay toi' })
  @Expose()
  upcomingStartCount!: number;
}
