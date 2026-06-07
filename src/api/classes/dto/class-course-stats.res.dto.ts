import { Expose } from 'class-transformer';

import { NumberField } from '../../../decorators/field.decorators';

export class ClassCourseStatsResDto {
  @NumberField({ description: 'So khoa hoc da gan vao lop' })
  @Expose()
  attachedCount!: number;

  @NumberField({ description: 'So khoa hoc bat buoc trong lop' })
  @Expose()
  requiredCount!: number;

  @NumberField({ description: 'So khoa hoc chua gan vao lop' })
  @Expose()
  unassignedCount!: number;
}
