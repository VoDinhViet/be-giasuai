import {
  NumberField,
  StringField,
  TokenField,
  UUIDField,
} from '../../../decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class LoginResDto {
  @Expose()
  @UUIDField()
  userId!: string;

  @Expose()
  @StringField()
  role!: string;

  @Expose()
  @StringField({ each: true })
  permissionCodes!: string[];

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
