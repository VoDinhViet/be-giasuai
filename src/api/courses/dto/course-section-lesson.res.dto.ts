import { Expose } from 'class-transformer';

import {
  BooleanField,
  NumberField,
  StringField,
  UUIDField,
} from '../../../decorators/field.decorators';

export class CourseSectionLessonResDto {
  @UUIDField({ description: 'ID bai hoc' })
  @Expose()
  id!: string;

  @UUIDField({ description: 'ID chuong hoc' })
  @Expose()
  sectionId!: string;

  @StringField({ description: 'Ten bai hoc' })
  @Expose()
  title!: string;

  @NumberField({ description: 'Thoi luong bai hoc', int: true, min: 0 })
  @Expose()
  durationMinutes!: number;

  @NumberField({ description: 'Thu tu bai hoc', int: true, min: 1 })
  @Expose()
  position!: number;

  @BooleanField({ description: 'Bai hoc xem thu' })
  @Expose()
  isPreview!: boolean;

  @BooleanField({ description: 'Trang thai xuat ban' })
  @Expose()
  isPublished!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
