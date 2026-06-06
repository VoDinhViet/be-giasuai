import { Exclude, Expose } from 'class-transformer';
import {
  DateField,
  StringFieldOptional,
  UUIDField,
} from '../../../decorators/field.decorators';

@Exclude()
export class UserProfileResDto {
  @UUIDField({ description: 'ID nguoi dung' })
  @Expose()
  userId!: string;

  @StringFieldOptional({ description: 'So dien thoai' })
  @Expose()
  phone!: string | null;

  @StringFieldOptional({ description: 'Khu vuc sinh song/hoc tap' })
  @Expose()
  location!: string | null;

  @StringFieldOptional({ description: 'Gioi thieu ngan' })
  @Expose()
  bio!: string | null;

  @StringFieldOptional({ description: 'URL anh dai dien' })
  @Expose()
  avatarUrl!: string | null;

  @DateField({ description: 'Thoi diem tao ho so' })
  @Expose()
  createdAt!: Date;

  @DateField({
    description: 'Thoi diem cap nhat ho so',
  })
  @Expose()
  updatedAt!: Date;
}
