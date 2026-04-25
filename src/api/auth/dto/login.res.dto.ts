import {
  NumberField,
  TokenField,
  UUIDField,
} from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class LoginResDto {
  @Expose()
  @UUIDField()
  userId!: string;

  @Expose()
  @TokenField()
  accessToken!: string;

  @Expose()
  @TokenField()
  refreshToken!: string;

  @Expose()
  @NumberField()
  tokenExpires!: number;
}
