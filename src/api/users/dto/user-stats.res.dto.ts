import { Expose } from 'class-transformer';
import { NumberField } from '..\..\../decorators/field.decorators';

export class UserStatsResDto {
  @NumberField({ description: 'Tổng số người dùng' })
  @Expose()
  total: number;

  @NumberField({ description: 'Người dùng mới trong ngày' })
  @Expose()
  new: number;

  @NumberField({ description: 'Người dùng đang hoạt động' })
  @Expose()
  active: number;

  @NumberField({ description: 'Tài khoản bị khóa' })
  @Expose()
  locked: number;
}
