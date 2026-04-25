import { PasswordField, StringField } from '..\..\../decorators/field.decorators';

export class LoginReqDto {
  @StringField({ description: 'Username hoac email', toLowerCase: true })
  emailOrUsername!: string;

  @PasswordField()
  password!: string;
}
