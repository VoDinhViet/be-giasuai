import { Exclude, Expose } from 'class-transformer';
import {
  BooleanField,
  StringField,
  UUIDField,
} from '../../../decorators/field.decorators';

@Exclude()
export class UserResDto {
  @UUIDField({ description: 'ID người dùng' })
  @Expose()
  id: string;

  @StringField({ description: 'Email' })
  @Expose()
  email: string;

  @StringField({ description: 'Username' })
  @Expose()
  username: string;

  @StringField({ description: 'Họ tên' })
  @Expose()
  fullName: string;

  @StringField({ description: 'Vai trò' })
  @Expose()
  role: string;

  @BooleanField({ description: 'Trạng thái khóa' })
  @Expose()
  isLocked: boolean;

  @Expose()
  createdAt: Date;
}
