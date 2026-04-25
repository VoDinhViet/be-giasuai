import { BooleanField } from '../../../decorators/field.decorators';

export class LockUserDto {
  @BooleanField({ description: 'Trạng thái khóa' })
  isLocked: boolean;
}
