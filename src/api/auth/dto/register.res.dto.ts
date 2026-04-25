import { UUIDField } from '../../../decorators/field.decorators';
import { Expose } from 'class-transformer';
import type { Uuid } from '../../../common/types/common.type';

export class RegisterResDto {
  @UUIDField({ description: 'ID của người dùng vừa đăng ký' })
  @Expose()
  userId: Uuid;
}
