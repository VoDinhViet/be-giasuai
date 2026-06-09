import { Exclude, Expose } from 'class-transformer';

import {
  NumberField,
  StringField,
  UUIDField,
} from '../../../decorators/field.decorators';

@Exclude()
export class LessonResDto {
  @UUIDField({ description: 'ID bai hoc' })
  @Expose()
  id: string;

  @StringField({ description: 'Ma bai hoc' })
  @Expose()
  code: string;

  @StringField({ description: 'Ten bai hoc' })
  @Expose()
  title: string;

  @NumberField({ description: 'Thoi luong bai hoc theo phut' })
  @Expose()
  durationMinutes: number;

  @StringField({ description: 'Loai bai hoc' })
  @Expose()
  type: string;

  @StringField({ description: 'Trang thai bai hoc' })
  @Expose()
  status: string;

  @NumberField({ description: 'So tai nguyen' })
  @Expose()
  resourceCount: number;

  @NumberField({ description: 'Thu tu hien thi' })
  @Expose()
  position: number;
}
