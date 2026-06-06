import {
  EmailField,
  EnumField,
  PasswordField,
  StringField,
} from '../../../decorators/field.decorators';
import { UserRole } from '../../../constants/role.constant';

export class RegisterReqDto {
  @EmailField({ description: 'Địa chỉ email của người dùng' })
  email: string;

  @PasswordField({ description: 'Mật khẩu người dùng' })
  password: string;

  @StringField({ description: 'Họ và tên người dùng' })
  fullName: string;

  @StringField({ description: 'Tên đăng nhập', toLowerCase: true })
  username: string;

  @EnumField(() => UserRole, { description: 'Vai trò của người dùng' })
  role: UserRole;
}
