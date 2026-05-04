import {
  EmailField,
  EnumField,
  PasswordField,
  StringField,
} from '../../../decorators/field.decorators';
import { Role } from '../../../constants/role.constant';

export class CreateUserDto {
  @EmailField({ description: 'Địa chỉ email của người dùng' })
  email: string;

  @PasswordField({ description: 'Mật khẩu người dùng' })
  password: string;

  @StringField({ description: 'Họ và tên người dùng' })
  fullName: string;

  @StringField({ description: 'Tên đăng nhập', toLowerCase: true })
  username: string;

  @EnumField(() => Role, {
    description: 'Vai trò của người dùng',
    default: Role.STUDENT,
  })
  role: Role;
}
