import { Expose } from 'class-transformer';

import {
  NumberField,
  StringField,
  UUIDField,
} from '../../../decorators/field.decorators';

export class UnassignedClassCourseResDto {
  @UUIDField({ description: 'ID khoa hoc' })
  @Expose()
  id!: string;

  @StringField({ description: 'Ma khoa hoc' })
  @Expose()
  code!: string;

  @StringField({ description: 'Ten khoa hoc' })
  @Expose()
  name!: string;

  @StringField({ description: 'Danh muc khoa hoc' })
  @Expose()
  category!: string;

  @NumberField({ description: 'So bai hoc' })
  @Expose()
  lessonCount!: number;
}
