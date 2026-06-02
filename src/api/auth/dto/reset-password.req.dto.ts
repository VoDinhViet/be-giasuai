import {
  EmailField,
  PasswordField,
  StringField,
} from '../../../decorators/field.decorators';

export class ResetPasswordReqDto {
  @EmailField({ description: 'Email can reset mat khau' })
  email!: string;

  @StringField({
    description: 'Ma OTP reset mat khau gom 6 chu so',
    minLength: 6,
    maxLength: 6,
  })
  otpCode!: string;

  @PasswordField({ description: 'Mat khau moi' })
  newPassword!: string;
}
