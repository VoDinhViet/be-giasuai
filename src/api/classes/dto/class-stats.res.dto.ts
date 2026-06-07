import { Expose } from 'class-transformer';

import { NumberField } from '../../../decorators/field.decorators';

export class ClassStatsResDto {
  @NumberField({ description: 'Tong so lop hoc' })
  @Expose()
  total!: number;

  @NumberField({ description: 'Tong hoc vien dang hoc' })
  @Expose()
  learners!: number;

  @NumberField({ description: 'So lop sap mo' })
  @Expose()
  upcoming!: number;
}
