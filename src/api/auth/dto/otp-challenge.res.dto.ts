import { Exclude, Expose } from 'class-transformer';

import { NumberField } from '../../../decorators/field.decorators';

@Exclude()
export class OtpChallengeResDto {
  @Expose()
  @NumberField({ description: 'Thoi gian OTP het han, tinh bang giay' })
  expiresInSeconds!: number;
}
