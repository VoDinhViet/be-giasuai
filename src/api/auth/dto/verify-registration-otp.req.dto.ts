import { StringField, UUIDField } from '../../../decorators/field.decorators';

export class VerifyRegistrationOtpReqDto {
  @UUIDField({ description: 'ID nguoi dung can xac thuc OTP dang ky' })
  userId!: string;

  @StringField({
    description: 'Ma OTP dang ky gom 6 chu so',
    minLength: 6,
    maxLength: 6,
  })
  otpCode!: string;
}
