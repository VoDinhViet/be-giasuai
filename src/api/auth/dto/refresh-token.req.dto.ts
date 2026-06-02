import { TokenField } from '../../../decorators/field.decorators';

export class RefreshTokenReqDto {
  @TokenField({ description: 'Refresh token da cap khi dang nhap' })
  refreshToken!: string;
}
