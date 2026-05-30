import { Expose } from 'class-transformer';
import { ToFileUrl } from '../../../decorators/transform.decorators';
import {
  BooleanField,
  StringField,
  StringFieldOptional,
  URLFieldOptional,
  UUIDField,
} from '../../../decorators/field.decorators';

export class CourseResDto {
  @UUIDField({ description: 'ID khoa hoc' })
  @Expose()
  id!: string;

  @StringField({ description: 'Ten khoa hoc' })
  @Expose()
  title!: string;

  @StringField({ description: 'Slug khoa hoc' })
  @Expose()
  slug!: string;

  @StringFieldOptional({ description: 'Mo ta khoa hoc' })
  @Expose()
  description?: string | null;

  @URLFieldOptional({ description: 'Anh dai dien khoa hoc' })
  @Expose()
  @ToFileUrl()
  thumbnailUrl?: string | null;

  @StringFieldOptional({ description: 'Danh sach tag khoa hoc', each: true })
  @Expose()
  tags!: string[];

  @StringFieldOptional({
    description: 'Danh sach muc tieu dau ra',
    each: true,
  })
  @Expose()
  learningOutcomes!: string[];

  @BooleanField({ description: 'Trang thai xuat ban' })
  @Expose()
  isPublished!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
