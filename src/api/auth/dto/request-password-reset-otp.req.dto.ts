import { EmailField } from '../../../decorators/field.decorators';

export class RequestPasswordResetOtpReqDto {
  @EmailField({ description: 'Email can reset mat khau' })
  email!: string;
}
