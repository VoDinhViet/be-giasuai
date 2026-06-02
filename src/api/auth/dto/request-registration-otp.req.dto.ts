import { UUIDField } from '../../../decorators/field.decorators';

export class RequestRegistrationOtpReqDto {
  @UUIDField({ description: 'ID nguoi dung can gui lai OTP dang ky' })
  userId!: string;
}
