import { Exclude, Expose } from 'class-transformer';
import {
  BooleanField,
  StringField,
  UUIDField,
} from '../../../decorators/field.decorators';
import { UserProfileResDto } from './user-profile.res.dto';

@Exclude()
export class UserResDto {
  @UUIDField({ description: 'ID người dùng' })
  @Expose()
  id!: string;

  @StringField({ description: 'Email' })
  @Expose()
  email!: string;

  @StringField({ description: 'Username' })
  @Expose()
  username!: string;

  @StringField({ description: 'Họ tên' })
  @Expose()
  fullName!: string;

  @StringField({ description: 'Vai trò' })
  @Expose()
  role!: string;

  @StringField({ description: 'Ma quyen', each: true })
  @Expose()
  permissionCodes!: string[];

  @BooleanField({ description: 'Trạng thái khóa' })
  @Expose()
  isLocked!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  profile!: UserProfileResDto;
}
