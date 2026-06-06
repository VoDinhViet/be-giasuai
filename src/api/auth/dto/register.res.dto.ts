import { Exclude, Expose } from 'class-transformer';

import { UUIDField } from '../../../decorators/field.decorators';
import type { Uuid } from '../../../common/types/common.type';

@Exclude()
export class RegisterResDto {
  @UUIDField({ description: 'ID của người dùng vừa đăng ký' })
  @Expose()
  userId!: Uuid;
}
