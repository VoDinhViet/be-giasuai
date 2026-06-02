import { Exclude, Expose } from 'class-transformer';

import { BooleanField } from '../../../decorators/field.decorators';

@Exclude()
export class VerifyRegistrationOtpResDto {
  @Expose()
  @BooleanField({ description: 'Email da xac thuc OTP thanh cong' })
  isVerified!: boolean;

  @Expose()
  @BooleanField({
    description: 'Tai khoan Teacher van can Admin xac thuc sau OTP',
  })
  requiresAdminVerification!: boolean;
}
