import {
  BooleanFieldOptional,
  EmailFieldOptional,
  EnumFieldOptional,
  PasswordFieldOptional,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import { UserRole } from '../../../constants/role.constant';

export class UpdateUserReqDto {
  @EmailFieldOptional({ description: 'Dia chi email cua nguoi dung' })
  email?: string;

  @StringFieldOptional({ description: 'Ten dang nhap', toLowerCase: true })
  username?: string;

  @StringFieldOptional({ description: 'Ho va ten nguoi dung' })
  fullName?: string;

  @PasswordFieldOptional({ description: 'Mat khau moi cua nguoi dung' })
  password?: string;

  @EnumFieldOptional(() => UserRole, {
    description: 'Vai tro cua nguoi dung',
  })
  role?: UserRole;

  @BooleanFieldOptional({ description: 'Trang thai khoa tai khoan' })
  isLocked?: boolean;

  @StringFieldOptional({ description: 'So dien thoai', maxLength: 32 })
  phone?: string;

  @StringFieldOptional({
    description: 'Khu vuc sinh song/hoc tap',
    maxLength: 160,
  })
  location?: string;

  @StringFieldOptional({ description: 'Gioi thieu ngan', maxLength: 1000 })
  bio?: string;

  @StringFieldOptional({ description: 'URL anh dai dien', maxLength: 1000 })
  avatarUrl?: string;
}
