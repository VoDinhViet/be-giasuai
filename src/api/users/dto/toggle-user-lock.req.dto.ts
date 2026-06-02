import { BooleanField } from '../../../decorators/field.decorators';

export class ToggleUserLockReqDto {
  @BooleanField({ description: 'true de khoa tai khoan, false de mo khoa' })
  isLocked!: boolean;
}
